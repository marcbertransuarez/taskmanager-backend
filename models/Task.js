const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const taskSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      enum: ["Completed", "Incompleted"],
      required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Task', taskSchema);