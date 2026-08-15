export interface Showroom {
  id?: string;
  code: string;
  name: string;
  address?: string;
  managerName?: string;
}

export interface ShowroomInventory {
  id?: string;
  showroomId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
}
