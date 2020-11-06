const { model, Schema } = require('mongoose');

const SignSchema = new Schema(
  {
    file: {
      type: Schema.Types.ObjectId,
      ref: 'File'
    },
    signature: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Sign', SignSchema);
