export type Message =
  | {
      chatId: string;
      type: "text";
      text: string;
    }
  | {
      chatId: string;
      type: "media";
      caption?: string;
      file?: File;
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
  id: string;
  name: string;
  emoji: string;
  color: string;
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
  provider: MessagingProvider;
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

export type Pagination = {
  limit: number;
  offset: number;
};

export type MessagingProvider =
  | "unknown"
  | "B2CBOTAPI"
  | "FACEBOOK"
  | "INSTAGRAM"
  | "LIVECHAT"
  | "TELEGRAM"
  | "WHATSAPP360"
  | "WHATSAPPBM"
  | "WHATSAPPOFF";

export type FindChatQuery = Pagination & {
  chatId?: string;
  contactName?: string;
  provider?: MessagingProvider;
  unanswered?: boolean;
  tags?: string[];
};

export type FindChatResponse = {
  query: FindChatQuery;
  total: number;
  data: Chat[];
};
export type FindContactQuery = Pagination & {
  name: string;
  company?: string;
};

export type FindContactResponse = {
  query: FindContactQuery;
  total: number;
  data: Contact[];
};

export type Contact = {
  id: number;
  fullName: string;
  identificationNumber: string;
  email: string;
  phoneNumber: string;
  mobileNumber: string;
  country: string;
  province: string;
  city: string;
  cityName: string;
  address: string;
  company: string;
  remarks: string;
  isNewContact: boolean;
  lastUpdate: string;
  createAt: string;
  attributes: ContactInfoAttr;
  blacklisted: boolean;
  totalCount: number;
};
