import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SavedVacancy } from './models/saved-vacancy.model';
import { Vacancy } from '../vacancies/models/vacancy.model';
import { Company } from '../companies/models/company.model';
import { Category } from '../categories/models/category.model';

@Injectable()
export class SavedVacanciesService {
  constructor(
    @InjectModel(SavedVacancy) private readonly model: typeof SavedVacancy,
    @InjectModel(Vacancy) private readonly vacancyModel: typeof Vacancy,
  ) {}

  async save(userId: number, vacancyId: number) {
    const vacancy = await this.vacancyModel.findByPk(vacancyId);
    if (!vacancy) throw new NotFoundException('Vacancy topilmadi');

    const exists = await this.model.findOne({ where: { user_id: userId, vacancy_id: vacancyId } });
    if (exists) throw new ConflictException('Bu vakansiya allaqachon saqlangan');

    const saved = await this.model.create({ user_id: userId, vacancy_id: vacancyId });
    return { success: true, message: 'Vakansiya saqlandi', data: saved };
  }

  async getSaved(userId: number) {
    const saved = await this.model.findAll({
      where: { user_id: userId },
      include: [{ model: Vacancy, include: [Company, Category] }],
      order: [['created_at', 'DESC']],
    });
    return { success: true, data: saved.map(s => s.vacancy) };
  }

  async remove(userId: number, vacancyId: number) {
    const saved = await this.model.findOne({ where: { user_id: userId, vacancy_id: vacancyId } });
    if (!saved) throw new NotFoundException('Saqlangan vakansiya topilmadi');
    await saved.destroy();
    return { success: true, message: 'Vakansiya saqlanganlardan ochirildi' };
  }

  async isSaved(userId: number, vacancyId: number) {
    const saved = await this.model.findOne({ where: { user_id: userId, vacancy_id: vacancyId } });
    return { success: true, saved: !!saved };
  }
}
