import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;

  value: number;

  type: 'income' | 'outcome';

  category_name: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_name,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type invalid', 400);
    }

    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      if (value > balance.total) {
        throw new AppError('The exit value has exceeded your balance.');
      }
    }

    const searchCategory = await categoriesRepository.findOne({
      where: { title: category_name },
    });

    const transactionCreate = transactionsRepository.create({
      title,
      value,
      type,
    });

    if (searchCategory) {
      transactionCreate.category = searchCategory;
    } else {
      const categoryCreate = categoriesRepository.create({
        title: category_name,
      });
      const category = await categoriesRepository.save(categoryCreate);
      transactionCreate.category = category;
    }

    await transactionsRepository.save(transactionCreate);

    return transactionCreate;
  }
}

export default CreateTransactionService;
