import { atom } from "recoil";

type Bet = {
  id: string;
  propId: string;
  name: string;
  picture: string;
  title: string;
  type: "simple" | "firstToComplete";
  status?: "Over" | "Under";
  line?: number;
  odds?: number;
  participant?: string;
};

export const selectedBetState = atom<Bet[]>({
  key: "selectedBetState",
  default: [],
});
