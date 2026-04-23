import mongoose, { Model, Schema, Types, type Document } from "mongoose";
import { OrderStatus, type IOrder } from "../types/order.types.js";

export interface OrderDocument extends IOrder, Document { }

const GeoLocationSchema = new Schema({
    type: {
        type: String,
        enum: ["Point"],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    },
}, { _id: false });


const StatusHistorySchema = new Schema({
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        required: true,
    },

    changedAt: {
        type: Date,
        default: Date.now,
    },

    changedBy: {
        type: Types.ObjectId,
        default: null,
    },

    actorRole: {
        type: String,
        enum: ["customer", "restaurant_manager", "driver", "system"],
        required: true,
    },

    note: { type: String },
}, { _id: false });


const ItemsSchema = new Schema({
    menuItemId: {
        type: Types.ObjectId,
        ref: "MenuItem",
        required: true,
    },

    categoryId: {
        type: Types.ObjectId,
        ref: "Category",
        default: null,
    },

    name: {
        type: String,
        required: true,
    },

    image: {
        type: String,
        default: null,
    },

    price: {
        type: Number,
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
    },

    total: {
        type: Number,
        required: true,
    },
}, { _id: false });

const DeliveryAddressSnapshotSchema = new Schema({
    address: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    pincode: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: GeoLocationSchema,
        required: true,
    },
}, { _id: false });

const RatingSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: { type: String },
}, { _id: false });


const OrderSchema = new Schema({
    customerId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },

    restaurantId: {
        type: Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },

    driverId: {
        type: Types.ObjectId,
        ref: "Driver",
        default: null,
    },

    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.PLACED,
    },

    statusHistory: {
        type: [StatusHistorySchema],
        default: [],
    },

    items: {
        type: [ItemsSchema],
        required: true,
        validate: {
            validator: function (val: any[]) {
                return val.length > 0;
            },
            message: "Order must have at least one item",
        },
    },

    deliveryAddress: {
        type: Types.ObjectId,
        ref: "Address",
        required: true,
    },

    deliveryAddressSnapshot: {
        type: DeliveryAddressSnapshotSchema,
        required: true,
    },

    deliveryLocation: {
        type: GeoLocationSchema,
        required: true,
    },

    subTotal: {
        type: Number,
        required: true,
    },

    deliveryFee: {
        type: Number,
        default: 0,
    },

    total: {
        type: Number,
        required: true,
    },

    restaurantRating: {
        type: RatingSchema,
        default: null,
    },

    driverRating: {
        type: RatingSchema,
        default: null,
    },
}, { timestamps: true });

OrderSchema.index({ customerId: 1 });
OrderSchema.index({ restaurantId: 1 });
OrderSchema.index({ driverId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ deliveryLocation: "2dsphere" });

// Add initial status history
OrderSchema.pre("save", async function () {
    if (this.isNew && this.statusHistory.length === 0) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
            changedBy: this.customerId,
            actorRole: "customer",
        });
    }
});


const OrderModel: Model<OrderDocument> =
    mongoose.model<OrderDocument>("Order", OrderSchema);

export default OrderModel;
