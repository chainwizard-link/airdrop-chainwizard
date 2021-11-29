import { Injectable } from '@angular/core';
import * as CsvParser from 'csv-parse';

@Injectable({
  providedIn: 'root'
})
export class CsvParserService {

  constructor() { }

  public parseCsv(file, cb): void {
    
    CsvParser(file, (error, data) => {
      
      if (error || data.find((oneItem) => {
        return oneItem.length > 1;
      })) {
        cb({error, data});
      } else {
        
        CsvParser(file, {
          delimiter: ';'
        } as any, (error2, data2) => {
          cb({error: error2, data: data2});
        });
      }
    });
  }


}
