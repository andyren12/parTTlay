import { atom } from "recoil";

type Bet = {
  name: string;
  picture: string;
  title: string;
  status: string;
  line: number;
};

export const selectedBetState = atom<Bet[]>({
  key: "selectedBetState",
  default: [],
});
