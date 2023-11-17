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
     * @param pattern a
     * @returns
     */
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

    updateContactInfo: (
      contactId: string,
      contactInfo: Partial<Omit<ContactInfo, "contactId">>
    ): Promise<boolean> =>
      callFunction(this.port, "updateContactInfo", contactId, contactInfo),

    getContactInfo: (contactId: string): Promise<ContactInfo> =>
      callFunction(this.port, "getContactInfo", contactId),

    setInputMessageContent: (content: InputMessageContent) => {
      callFunction(this.port, "setInputMessageContent", content);
    },

    sendMessage: (
      message: Message
    ): Promise<{ contactId: string; messageId: string }> =>
      callFunction(this.port, "chatInput/write", message),
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
