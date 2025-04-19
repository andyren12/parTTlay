import { atom } from "recoil";

type Bet = {
  id: string;
  propId: string;
  name: string;
  picture: string;
  title: string;
  status: string;
  line: number;
  odds: number;
};

export const selectedBetState = atom<Bet[]>({
  key: "selectedBetState",
  default: [],
});
