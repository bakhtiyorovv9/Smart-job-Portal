import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { InjectModel } from '@nestjs/sequelize';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op } from 'sequelize';
import { User } from '../users/models/user.model';
import { Vacancy } from '../vacancies/models/vacancy.model';
import { Company } from '../companies/models/company.model';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Vacancy) private readonly vacancyModel: typeof Vacancy,
  ) {}

  async notifyNewJob(vacancy: Vacancy) {
    const users = await this.userModel.findAll({
      where: { telegram_id: { [Op.ne]: null } } as any,
    });

    const message =
      `🆕 *Yangi vakansiya!*\n\n` +
      `💼 *${vacancy.title}*\n` +
      `📍 ${vacancy.location || '—'}\n` +
      `💰 ${vacancy.salary ? vacancy.salary.toLocaleString() + ' so\u2018m' : 'Kelishilgan holda'}\n\n` +
      `📝 ${vacancy.description?.substring(0, 150)}...`;

    for (const user of users) {
      try {
        await this.bot.telegram.sendMessage(user.telegram_id, message, {
          parse_mode: 'Markdown',
        });
      } catch (err: any) {
        this.logger.error(
          `Failed to send to ${user.telegram_id}: ${err.message}`,
        );
      }
    }
  }

  async notifyApplicationStatus(
    telegramId: string,
    vacancyTitle: string,
    status: string,
  ) {
    const emojis: Record<string, string> = {
      pending: '⏳',
      reviewed: '👀',
      accepted: '✅',
      rejected: '❌',
    };
    const statusEmoji = emojis[status] || '❓';

    const message =
      `📨 *Ariza holati yangilandi*\n\n` +
      `💼 ${vacancyTitle}\n` +
      `${statusEmoji} Yangi holat: *${status.toUpperCase()}*`;

    try {
      await this.bot.telegram.sendMessage(telegramId, message, {
        parse_mode: 'Markdown',
      });
    } catch (err: any) {
      this.logger.error(`Failed to notify ${telegramId}: ${err.message}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyReport() {
    this.logger.log('Sending daily report...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newVacancies = await this.vacancyModel.findAll({
      where: {
        created_at: { [Op.between]: [yesterday, today] },
        is_active: true,
      } as any,
      include: [Company],
    });

    if (!newVacancies.length) return;

    const users = await this.userModel.findAll({
      where: { telegram_id: { [Op.ne]: null } } as any,
    });

    let message = `🌅 *Kunlik hisobot*\n\n`;
    message += `📊 Kecha ${newVacancies.length} ta yangi vakansiya qo\u2018shildi:\n\n`;

    newVacancies.forEach((v, i) => {
      message += `${i + 1}. *${v.title}* (${v.company?.name || '—'})\n`;
    });

    for (const user of users) {
      try {
        await this.bot.telegram.sendMessage(user.telegram_id, message, {
          parse_mode: 'Markdown',
        });
      } catch (err: any) {
        this.logger.error(`Failed: ${err.message}`);
      }
    }
  }
}
