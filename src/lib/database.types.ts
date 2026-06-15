export interface Database {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          name: string
          xp: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string
          xp?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          xp?: number
          created_at?: string
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          trip_id: string
          title: string
          emoji: string
          description: string
          gradient: string
          accent: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          id: string
          trip_id: string
          title: string
          emoji: string
          description: string
          gradient: string
          accent: string
          sort_order?: number
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['tracks']['Insert']>
      }
      days: {
        Row: {
          id: string
          track_id: string
          trip_id: string
          date: string
          label: string
          subtitle: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          id: string
          track_id: string
          trip_id: string
          date: string
          label: string
          subtitle?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['days']['Insert']>
      }
      activities: {
        Row: {
          id: string
          day_id: string
          trip_id: string
          title: string
          description: string | null
          time: string | null
          location: string | null
          category: string
          tag: string
          xp: number
          completed: boolean
          custom: boolean
          image_url: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          day_id: string
          trip_id: string
          title: string
          description?: string | null
          time?: string | null
          location?: string | null
          category?: string
          tag?: string
          xp?: number
          completed?: boolean
          custom?: boolean
          image_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['activities']['Insert']>
      }
    }
  }
}

export type DbActivity = Database['public']['Tables']['activities']['Row']
export type DbDay = Database['public']['Tables']['days']['Row']
export type DbTrack = Database['public']['Tables']['tracks']['Row']
export type DbTrip = Database['public']['Tables']['trips']['Row']
