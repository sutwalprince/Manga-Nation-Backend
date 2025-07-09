import mongoose, { Schema } from "mongoose";
const chapterSchema = new Schema(
  {
    mangaId: {
      type: Schema.Types.ObjectId,
      ref: "Manga",
      required: true,
    },
    chapterNumber: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: "",
    },
    pages: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const Chapter = mongoose.model("Chapter", chapterSchema);
