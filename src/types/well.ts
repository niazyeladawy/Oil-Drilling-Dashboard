// /types/well.ts
export interface WellDataRow {
  DEPTH: number;
  '%SH': number;
  '%SS': number;
  '%LS': number;
  '%DOL': number;
  '%ANH': number;
  '%Coal': number;
  '%Salt': number;
  DT: number;
  GR: number;
    [key: string]: number; // 👈 add this

}

export interface Well {
  id: number;
  name: string;
  data: WellDataRow[]; // <-- this is your JSON from the DB
}
