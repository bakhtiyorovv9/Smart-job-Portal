import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vacancy } from '../../modules/vacancies/models/vacancy.model';

@Injectable()
export class ParseVacancyIdPipe implements PipeTransform {
  constructor(
    @InjectModel(Vacancy) private readonly vacancyModel: typeof Vacancy,
  ) {}

  async transform(value: any): Promise<number> {
    const id = Number(value);

    if (isNaN(id) || id <= 0) {
      throw new BadRequestException(
        'Vacancy id musbat raqam bo\u2018lishi kerak',
      );
    }

    const vacancy = await this.vacancyModel.findByPk(id);
    if (!vacancy) {
      throw new NotFoundException(`Vacancy ${id} topilmadi`);
    }

    return id;
  }
}
