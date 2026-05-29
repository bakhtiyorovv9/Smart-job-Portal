import { Ctx, Help, Start, Update, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { Vacancy } from '../vacancies/models/vacancy.model';
import { Application } from '../applications/models/application.model';
import { Company } from '../companies/models/company.model';

@Update()
export class TelegramUpdate {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Vacancy) private readonly vacancyModel: typeof Vacancy,
    @InjectModel(Application)
    private readonly applicationModel: typeof Application,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    const chatId = ctx.chat?.id;
    const firstName = (ctx.from as any)?.first_name || 'foydalanuvchi';

    await ctx.reply(
      `👋 Salom, ${firstName}!\n\n` +
        `🏢 Smart Job Portal botiga xush kelibsiz!\n\n` +
        `📌 Sizning Chat ID: \`${chatId}\`\n\n` +
        `Akkountingizga ulash uchun bu ID ni profilingizga kiriting.\n\n` +
        `Buyruqlar:\n` +
        `/jobs - so\u2018nggi vakansiyalar\n` +
        `/myapplications - mening arizalarim\n` +
        `/help - yordam`,
      { parse_mode: 'Markdown' },
    );
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.reply(
      `📖 *Yordam*\n\n` +
        `/start - botni boshlash\n` +
        `/jobs - so\u2018nggi 5 ta vakansiya\n` +
        `/myapplications - mening arizalarim\n` +
        `/help - ushbu yordam\n\n` +
        `📨 Yangi vakansiya chiqqanda va ariza holati o\u2018zgarganda avtomatik xabar olasiz.`,
      { parse_mode: 'Markdown' },
    );
  }

  @Command('jobs')
  async jobs(@Ctx() ctx: Context) {
    const vacancies = await this.vacancyModel.findAll({
      where: { is_active: true },
      include: [Company],
      limit: 5,
      order: [['created_at', 'DESC']],
    });

    if (!vacancies.length) {
      await ctx.reply('😔 Hozircha vakansiyalar yo\u2018q.');
      return;
    }

    let message = '💼 *So\u2018nggi vakansiyalar:*\n\n';
    vacancies.forEach((v, i) => {
      message += `${i + 1}. *${v.title}*\n`;
      message += `🏢 ${v.company?.name || '—'}\n`;
      message += `📍 ${v.location || '—'}\n`;
      message += `💰 ${v.salary ? v.salary.toLocaleString() + ' so\u2018m' : 'Kelishilgan holda'}\n\n`;
    });

    await ctx.reply(message, { parse_mode: 'Markdown' });
  }

  @Command('myapplications')
  async myApplications(@Ctx() ctx: Context) {
    const chatId = String(ctx.chat?.id);

    const user = await this.userModel.findOne({
      where: { telegram_id: chatId },
    });

    if (!user) {
      await ctx.reply(
        '⚠️ Sizning telegram akkountingiz tizimga ulanmagan.\n\n' +
          '👉 /start buyrug\u2018ini bosib, Chat ID ni profilingizga kiriting.',
      );
      return;
    }

    const applications = await this.applicationModel.findAll({
      where: { user_id: user.id },
      include: [Vacancy],
      order: [['created_at', 'DESC']],
    });

    if (!applications.length) {
      await ctx.reply('📭 Sizda hali arizalar yo\u2018q.');
      return;
    }

    const emojis: Record<string, string> = {
      pending: '⏳',
      reviewed: '👀',
      accepted: '✅',
      rejected: '❌',
    };

    let message = '📨 *Sizning arizalaringiz:*\n\n';
    applications.forEach((a, i) => {
      const statusEmoji = emojis[a.status] || '❓';
      message += `${i + 1}. *${a.vacancy?.title || 'Vakansiya'}*\n`;
      message += `   ${statusEmoji} ${a.status}\n\n`;
    });

    await ctx.reply(message, { parse_mode: 'Markdown' });
  }
}
