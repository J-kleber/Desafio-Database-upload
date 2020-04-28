import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filePath: string;
}

class ImportTransactionsService {
  async execute({ filePath }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const csvFilePath = path.resolve(filePath);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const [, key] of lines.entries()) {
      const transaction = await createTransactionService.execute({
        title: key[0],
        type: key[1],
        value: key[2],
        category_name: key[3],
      });

      transactions.push(transaction);
    }

    await fs.promises.unlink(filePath);
    return transactions;
  }
}

export default ImportTransactionsService;
