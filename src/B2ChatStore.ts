import { bindEvent, bindProperty } from "./internal";
import {
  WidgetMessagePort,
  getWidgetMessagePort,
} from "./internal/WidgetMessagePort";
import { callFunction } from "./internal/callFunction";
import {
  ContactInfo,
  Message,
  Chat,
  MessageState,
  Agent,
  AgentOnlineStatus,
  Tag,
  Department,
  InputMessageContent,
  ContactInfoAttrProperties,
  FindContactQuery,
  FindContactResponse,
  FindChatQuery,
  FindChatResponse,
} from "./types";

const parentOrigin = new URLSearchParams(window.location.search).get(
  "parent-origin"
)!;

getWidgetMessagePort().addMessagePort(window.parent, parentOrigin);

export class B2ChatStore {
  port: WidgetMessagePort = getWidgetMessagePort();

  constructor() {
    this.state.activeChat.subscribe((value) =>
      this.events.onActiveChatChanged.dispatch(value)
    );
  }

  methods = {
    /**
     * Gen an UUID, this can be used to create a message
     */
    getUUID: (): Promise<string> => callFunction(this.port, "getUUID"),

    /**
     * find a chat by its name
     * @param pattern
     * @returns
     */
    findChat: (query: FindChatQuery): Promise<FindChatResponse> =>
      callFunction(this.port, "findChat", query),

    getTags: async (chatId: string): Promise<Tag[]> => {
      if (!chatId) return [];
      return callFunction(this.port, "getTags", chatId);
    },

    assignedTags: async (chatId: string): Promise<Tag[]> => {
      if (!chatId) return [];
      return callFunction(this.port, "assignedTags", chatId);
    },

    assignTag: (chatId: string, tag: Tag): Promise<boolean> =>
      callFunction(this.port, "assignTag", chatId, tag),

    unassignTag: (chatId: string, tag: Tag): Promise<boolean> =>
      callFunction(this.port, "unassignTag", chatId, tag),

    findContact: (query: FindContactQuery): Promise<FindContactResponse> =>
      callFunction(this.port, "findContact", query),

    updateChatInfo: (
      chatId: string,
      contactId: string,
      contactInfo: Partial<Omit<ContactInfo, "contactId">>
    ): Promise<boolean> =>
      callFunction(this.port, "updateChatInfo", chatId, contactId, contactInfo),

    getContactInfo: (contactId: string): Promise<ContactInfo> =>
      callFunction(this.port, "getContactInfo", contactId),

    getContactInfoProperties: (): Promise<ContactInfoAttrProperties[]> =>
      callFunction(this.port, "getContactInfoProperties"),

    setInputMessageContent: (content: InputMessageContent) => {
      callFunction(this.port, "setInputMessageContent", content);
    },

    sendMessage: (
      message: Message
    ): Promise<{ contactId: string; messageId: string }> =>
      callFunction(this.port, "sendMessage", message),
  };

  events = {
    onChatClosed: bindEvent<{
      reason: "closed-by-agent" | "closed-by-contact";
    }>(this.port, "chatClosed"),

    onActiveChatChanged: bindEvent<Chat>(this.port, "activeChatChanged"),

    onActiveContactInfoChanged: bindEvent<ContactInfo>(
      this.port,
      "activeContactInfoChanged"
    ),

    onMessageStateChanged: bindEvent<MessageState>(
      this.port,
      "messageStateChange"
    ),

    onContactInfoUpdated: bindEvent(this.port, "contactInfoChanged"),

    onTagsChanged: bindEvent<{ chatId: string }>(this.port, "tagsChanged"),

    onChatInputContentChanged: bindEvent(this.port, "inputMessageChanged"),
  };

  state = {
    /**
     * List of departments
     */
    departments: bindProperty<Department[]>(this.port, "departments", []),

    agentInfo: bindProperty<Agent>(this.port, "agentInfo", {
      fullName: "",
      username: "",
      email: "",
      mobileNumber: "",
      role: "",
      avatarUrl: undefined,
      departments: [],
    }),
    agentOnlineStatus: bindProperty<AgentOnlineStatus>(
      this.port,
      "agentOnline",
      "unavailable"
    ),
    activeChat: bindProperty<Chat>(this.port, "activeChat", {
      chatId: "",
      status: "CLOSED",
      serviceWindow: "EXPIRED",
      provider: "unknown",
      contact: {
        contactId: "",
        fullName: "",
        avatarUrl: "",
      },
      viewerUrl: "",
      tags: [],
      accountMessaging: {
        account: "",
        alias: "",
      },
      lastMessageReceivedAt: -1,
      lastMessageSentAt: -1,
      startTimestamp: -1,
    }),
    activeContactInfo: bindProperty<ContactInfo>(
      this.port,
      "activeContactInfo",
      {
        attributes: [],
      } as unknown as ContactInfo
    ),
    inputMessageContent: bindProperty<InputMessageContent>(
      this.port,
      "inputMessageContent",
      { chatId: "", text: "" }
    ),
  };
}

export const getB2ChatStore = (() => {
  let instance: B2ChatStore;

  return () => {
    return (instance ??= new B2ChatStore());
  };
})();
