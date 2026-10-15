import { Mongo } from "meteor/mongo";

const GLOBAL_METRICS_ID = "all-recruiters";

export const ChatMetrics = new Mongo.Collection("ai_chat_metrics");

export const incrementChatQuestionCount = () =>
  ChatMetrics.updateAsync(
    { _id: GLOBAL_METRICS_ID },
    { $inc: { questionCount: 1 } },
    { upsert: true },
  );
