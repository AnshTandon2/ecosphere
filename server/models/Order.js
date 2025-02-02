// order routes and model

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
        },
        ecoImpact: {
          carbonSaved: Number,
          waterSaved: Number,
          plasticReduced: Number,
        },
      },
    ],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ["credit_card", "paypal", "crypto"],
        required: true,
      },
      transactionId: String,
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    trackingInfo: {
      carrier: String,
      trackingNumber: String,
      estimatedDelivery: Date,
    },
    ecoDelivery: {
      type: Boolean,
      default: false,
    },
    carbonOffset: {
      amount: Number,
      verified: Boolean,
      certificateUrl: String,
    },
    notes: String,
    refundReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "paymentInfo.status": 1 });

// Virtual for total eco impact
orderSchema.virtual("totalEcoImpact").get(function () {
  return this.items.reduce(
    (total, item) => ({
      carbonSaved: total.carbonSaved + (item.ecoImpact.carbonSaved || 0),
      waterSaved: total.waterSaved + (item.ecoImpact.waterSaved || 0),
      plasticReduced:
        total.plasticReduced + (item.ecoImpact.plasticReduced || 0),
    }),
    { carbonSaved: 0, waterSaved: 0, plasticReduced: 0 }
  );
});

module.exports = mongoose.model("Order", orderSchema);
