import mongoose, { Schema } from "mongoose";
const mangaSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },

    coverImage: {
      type: String,
      required: true,
    },
    genres: [
      {
        type: String,
        trim: true,
      },
    ],
    authors: [
      {
        type: String,
        trim: true,
      },
    ],
    chapters: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],
    status: {
      type: String,
      enum: ["Ongoing", "Completed", "Hiatus", "Dropped"],
      default: "Ongoing",
    },
  },
  { timestamps: true }
);

export const Manga = mongoose.model("Manga", mangaSchema);
