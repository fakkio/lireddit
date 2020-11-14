import DataLoader from "dataloader";
import {Updoot} from "../entities/Updoot";

export const createUpdootLoader = () =>
  new DataLoader<{postId: number; userId: number}, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(
        keys as {postId: number; userId: number}[]
      );
      const updootsMap: Record<string, Updoot> = {};

      updoots.forEach((updoot) => {
        updootsMap[`${updoot.postId}-${updoot.userId}`] = updoot;
      });

      return keys.map((key) => updootsMap[`${key.postId}-${key.userId}`]);
    }
  );
