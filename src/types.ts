export type Message =
  | {
      chatId: string;
      type: "text";
      text: string;
    }
  | {
      chatId: string;
      type: "audio" | "video" | "image";
      caption?: string;
      url?: string;
      file?: Blob;
    };

export type MessageState = {
  messageId: string;
  state: "sent" | "failed";
};

export type Agent = {
  username: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  role: "ADMIN" | "AGENT" | "";
  avatarUrl?: string;
  departments: Department[];
};

export type Department = {
  departmentId: string;
  code: string;
  tagName: string;
  active: boolean;
};

export type Tag = {
  tagName: string;
  emoji: string;
  color: string;
  assigned: boolean;
} & {
  [key: string]: string;
};

export type AgentOnlineStatus = "available" | "unavailable";

export type Chat = {
  chatId: string;
  contact: {
    contactId: string;
    fullName: string;
    avatarUrl: string;
  };
  department?: Omit<Department, "active">;
  tags: Tag[];
  provider:
    | "livechat"
    | "whatsapp"
    | "telegram"
    | "instagram"
    | "facebook"
    | "b2chatbotapi"
    | "";
  /**
   * This tell as if the current chat is available
   */
  serviceWindow: "ACTIVE" | "EXPIRED";
  status:
    | "CLOSED"
    | "OPENED"
    | "PICKED_UP"
    | "CLOSED_BY_CONTACT"
    | "LEFT_BY_CONTACT";
  startTimestamp: number;
  lastMessageReceivedAt: number;
  lastMessageSentAt: number;
  viewerUrl: string;
  accountMessaging: {
    account: string;
    alias: string;
  };
};

export type ContactInfo = {
  contactId: string;
  fullName: string;
  identificationNumber: string;
  email: string;
  phoneNumber: string;
  mobileNumber: string;
  country: string;
  province: string;
  city: string;
  address: string;
  company: string;
  attributes: ContactInfoAttr[];
};

export type ContactInfoAttr = {
  attrId: number;
  name: string;
  value: string;
};

export type Contact = {
  id: string;
  fullName: string;
};

export type InputMessageContent = {
  chatId: string;
  text: string;
};

export type ContactInfoAttrProperties = {
  id: number;
  name: string;
  type: "NUMERIC" | "LARGE_TEXT" | "SHORT_TEXT" | "LIST";
  activated: boolean;
  required: boolean;
  order: 0;
  possibleValues: string[];
  numeric: number;
  list: boolean;
  shortText: boolean;
  largeText: boolean;
};
