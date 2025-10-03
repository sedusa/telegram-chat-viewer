export type MediaType = 'pdf' | 'zip' | 'image' | 'file' | null;

export interface Message {
  id: string;
  fromName: string;
  text: string;
  timestamp: string;
  mediaType: MediaType;
  mediaTitle?: string;
  links: string[];
  isLinkOnly: boolean;
  hasMedia: boolean;
}

export type ViewMode = 'list' | 'card';

export interface AppSettings {
  lastOpenedPath?: string;
  viewMode: ViewMode;
  windowBounds?: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
}

