import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    // shortID for final url
    shortID: {
      type: String,
      required: true,
      unique: true,
    },

    // original url
    redirectURL: {
      type: String,
      required: true,
    },
    //   array, it will hold at what time the short link was clicked
    visitHistory: [
      {
        timestamp: { type: Date, default: Date.now }, // Time of the visit
        userAgent: { type: String }, // Information about the client browser or device
        ipAddress: { type: String }, // IP address of the visitor
      },
    ],

    clickCount: {
      type: Number,
      default: 0,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const URL = mongoose.model("URL", urlSchema);
