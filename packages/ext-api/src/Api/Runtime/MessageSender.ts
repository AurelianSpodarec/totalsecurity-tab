import { Tab } from "../Tabs/Tab";
import { DocumentLifecycleEnum } from "../Shared/DocumentLifecycleEnum";

export interface MessageSender
{
  documentId?: string,
  documentLifecycle?: DocumentLifecycleEnum,
  frameId?: number, // Only set if tab is set
  id?: string, // Extension id of sender,
  nativeApplication?: string,
  origin?: string,
  tab?: Tab,
  tlsChannelId?: string,
  url?: string
}
