import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const { affected } = await transactionRepository.delete({ id });
    if (affected === 0) {
      throw new AppError('Error on delete', 400);
    }
  }
}

export default DeleteTransactionService;
