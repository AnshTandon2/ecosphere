// product schema and model

const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: [
        "clothing",
        "food",
        "beauty",
        "home",
        "electronics",
        "accessories",
      ],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    images: [
      {
        url: String,
        alt: String,
        isPrimary: Boolean,
      },
    ],
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
    },
    ecoAttributes: {
      organic: Boolean,
      recycled: Boolean,
      biodegradable: Boolean,
      sustainable: Boolean,
      fairtrade: Boolean,
      locallySourced: Boolean,
    },
    ecoImpact: {
      carbonFootprint: Number,
      waterUsage: Number,
      energyEfficiency: Number,
      recyclablePackaging: Boolean,
    },
    specifications: [
      {
        name: String,
        value: String,
      },
    ],
    variants: [
      {
        name: String,
        options: [
          {
            value: String,
            stock: Number,
            price: Number,
          },
        ],
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        images: [String],
        verified: Boolean,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published", "outOfStock", "discontinued"],
      default: "draft",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create slug from name
productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Indexes
productSchema.index({ name: "text", description: "text" });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ slug: 1 });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
