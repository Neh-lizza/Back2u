// src/types/database.ts
// TypeScript interfaces matching every Supabase table
// Used with createClient<Database>() for full type safety (NFR5.2)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── ENUMS ──────────────────────────────────────────────────
export type ItemType        = 'lost' | 'found'
export type ItemStatus      = 'active' | 'matched' | 'recovered' | 'archived' | 'pending_review' | 'rejected'
export type SensitivityLevel = 'normal' | 'sensitive' | 'very_sensitive'
export type MatchStatus     = 'pending' | 'accepted' | 'rejected' | 'expired'
export type ChatStatus      = 'active' | 'closed' | 'recovered'
export type MessageType     = 'text' | 'image' | 'location' | 'system'
export type FlagStatus      = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type NotificationType =
  | 'match_found'
  | 'chat_message'
  | 'recovery_confirmed'
  | 'item_expiring'
  | 'item_archived'
  | 'admin_approved'
  | 'admin_rejected'
  | 'flag_resolved'
export type UserRole        = 'user' | 'admin'
export type UserLanguage    = 'en' | 'fr' | 'pid'

// ── ROW TYPES ──────────────────────────────────────────────

export interface UserRow {
  id:              string
  email:           string
  full_name:       string
  avatar_url:      string | null
  city:            string | null
  region:          string | null
  language:        UserLanguage
  role:            UserRole
  rating:          number
  rating_count:    number
  reports_count:   number
  recovery_count:  number
  is_banned:       boolean
  ban_reason:      string | null
  created_at:      string
  updated_at:      string
}

export interface ItemRow {
  id:             string
  user_id:        string
  type:           ItemType
  title:          string
  description:    string | null
  category:       string | null
  photos:         string[]
  location_name:  string | null
  location_geo:   unknown | null  // PostGIS geography — use location_name for display
  city:           string | null
  region:         string | null
  status:         ItemStatus
  sensitivity:    SensitivityLevel
  admin_approved: boolean
  is_anonymous:   boolean
  flag_count:     number
  date_occurred:  string | null
  expires_at:     string
  created_at:     string
  updated_at:     string
}

export interface MatchRow {
  id:            string
  lost_item_id:  string
  found_item_id: string
  score:         number
  status:        MatchStatus
  initiated_by:  string | null
  created_at:    string
  updated_at:    string
}

export interface ChatRow {
  id:            string
  match_id:      string | null
  item_id:       string
  participant_a: string
  participant_b: string
  status:        ChatStatus
  created_at:    string
  updated_at:    string
}

export interface MessageRow {
  id:         string
  chat_id:    string
  sender_id:  string
  content:    string
  type:       MessageType
  read_at:    string | null
  created_at: string
}

export interface RecoveryRow {
  id:                 string
  item_id:            string
  chat_id:            string
  confirmed_by_a:     boolean
  confirmed_by_b:     boolean
  rating_by_a:        number | null
  rating_by_b:        number | null
  review_by_a:        string | null
  review_by_b:        string | null
  tip_amount:         number
  tip_status:         'none' | 'pending' | 'paid' | 'failed'
  tip_transaction_id: string | null
  created_at:         string
  updated_at:         string
}

export interface FlagRow {
  id:          string
  item_id:     string
  reported_by: string
  reason:      string
  status:      FlagStatus
  admin_note:  string | null
  created_at:  string
}

export interface NotificationRow {
  id:         string
  user_id:    string
  type:       NotificationType
  title:      string
  body:       string | null
  data:       Json
  read:       boolean
  created_at: string
}

// ── INSERT TYPES (for creating new rows) ───────────────────

export interface InsertItem {
  user_id:       string
  type:          ItemType
  title:         string
  description?:  string
  category?:     string
  photos?:       string[]
  location_name?: string
  city?:         string
  region?:       string
  sensitivity?:  SensitivityLevel
  is_anonymous?: boolean
  date_occurred?: string
}

export interface InsertMessage {
  chat_id:   string
  sender_id: string
  content:   string
  type?:     MessageType
}

export interface InsertFlag {
  item_id:     string
  reported_by: string
  reason:      string
}

// ── JOINED / ENRICHED TYPES (for UI) ──────────────────────

// Item with poster's public profile attached
export interface ItemWithUser extends ItemRow {
  user: Pick<UserRow, 'id' | 'full_name' | 'avatar_url' | 'city' | 'rating'> | null
}

// Chat with last message and other participant
export interface ChatWithDetails extends ChatRow {
  item:          Pick<ItemRow, 'id' | 'title' | 'type' | 'photos'> | null
  other_user:    Pick<UserRow, 'id' | 'full_name' | 'avatar_url'> | null
  last_message:  MessageRow | null
  unread_count:  number
}

// Match with both items attached
export interface MatchWithItems extends MatchRow {
  lost_item:  ItemWithUser | null
  found_item: ItemWithUser | null
}

// ── DATABASE TYPE (for Supabase client generics) ───────────

export interface Database {
  public: {
    Tables: {
      users: {
        Row:    UserRow
        Insert: Partial<UserRow> & Pick<UserRow, 'id' | 'email' | 'full_name'>
        Update: Partial<UserRow>
      }
      items: {
        Row:    ItemRow
        Insert: InsertItem
        Update: Partial<ItemRow>
      }
      matches: {
        Row:    MatchRow
        Insert: Omit<MatchRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<MatchRow>
      }
      chats: {
        Row:    ChatRow
        Insert: Omit<ChatRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<ChatRow>
      }
      messages: {
        Row:    MessageRow
        Insert: InsertMessage
        Update: Partial<MessageRow>
      }
      recoveries: {
        Row:    RecoveryRow
        Insert: Omit<RecoveryRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<RecoveryRow>
      }
      flags: {
        Row:    FlagRow
        Insert: InsertFlag
        Update: Partial<FlagRow>
      }
      notifications: {
        Row:    NotificationRow
        Insert: Omit<NotificationRow, 'id' | 'created_at'>
        Update: Partial<NotificationRow>
      }
    }
    Functions: {
      match_new_item: {
        Args: { new_item_id: string }
        Returns: void
      }
    }
  }
}