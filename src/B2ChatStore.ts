import { bindEvent, bindProperty } from "./internal";
import {
  WidgetMessagePort,
  getWidgetMessagePort,
} from "./internal/WidgetMessagePort";
import { callFunction } from "./internal/callFunction";
import {
  ContactInfo,
  Message,
  Contact,
  Chat,
  MessageState,
  Agent,
  AgentOnlineStatus,
  Tag,
  Department,
  InputMessageContent,
} from "./types";

getWidgetMessagePort().addMessagePort(window.parent, document.referrer);

export class B2ChatStore {
  port: WidgetMessagePort = getWidgetMessagePort();

  constructor() {
    this.state.activeChat.subscribe((value) =>
      this.events.onActiveChatChanged.dispatch(value)
    );
  }

  methods = {
    getUUID: (): Promise<string> => callFunction(this.port, "getUUID"),

    findChat: (pattern: string): Promise<Chat[]> =>
      callFunction(this.port, "findChat", pattern),

    getTags: async (chatId: string): Promise<Tag[]> => {
      if (!chatId) return [];
      return callFunction(this.port, "getTags", chatId);
    },

    assignedTags: async (chatId: string): Promise<Tag[]> => {
      if (!chatId) return [];
      return callFunction(this.port, "assignedTags", chatId);
    },

    assignTag: (chatId: string, tagName: string): Promise<boolean> =>
      callFunction(this.port, "assignTag", chatId, tagName),

    unassignTag: (chatId: string, tagName: string): Promise<boolean> =>
      callFunction(this.port, "unassignTag", chatId, tagName),

    updateContactInfo: (contactInfo: Partial<ContactInfo>): Promise<boolean> =>
      callFunction(this.port, "updateContactInfo", contactInfo),

    setInputMessageContent: (content: InputMessageContent) => {
      callFunction(this.port, "setInputMessageContent", content);
    },

    sendMessage: (
      message: Message
    ): Promise<{ contactId: string; messageId: string }> =>
      callFunction(this.port, "chatInput/write", message),
  };

  events = {
    onChatClosed: bindEvent(this.port, "chatClosed"),

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
      provider: "",
      contact: {
        contactId: "",
        fullName: "",
        avatarUrl: "",
      },
      viewerUrl: "",
      tags: [],
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
