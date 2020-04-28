import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Request {
  title: string;

  value: number;

  type: 'income' | 'outcome';

  category_id: string;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions.reduce((accumulator, currentValue) => {
      if (currentValue.type === 'income') {
        return accumulator + currentValue.value;
      }
      return accumulator;
    }, 0);
    const outcome = transactions.reduce((accumulator, currentValue) => {
      if (currentValue.type === 'outcome') {
        return accumulator + currentValue.value;
      }
      return accumulator;
    }, 0);
    const total = income - outcome;
    return {
      income,
      outcome,
      total,
    };
  }

  // public create({ title, value, type, category_id }: Request): Transaction {
  //   const transaction = new Transaction({ title, value, type, category_id });
  //   this.transactions.push(transaction);

  //   return transaction;
  // }
}

export default TransactionsRepository;
