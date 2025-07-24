export interface SubRowData {
  versionId: number;
  date: string;
  name: string;
  version: string;
  isUsed: boolean;
}

export const dummySubRows: SubRowData[] = [
  {
    versionId: 112,
    date: "2025/04/04",
    name: "사용자명 정의방식",
    version: "1.0.2",
    isUsed: true
  },
  {
    versionId: 15,
    date: "2025/06/08",
    name: "ID 생성 관련 작성 기준표",
    version: "1.0.1",
    isUsed: false
  }
];
