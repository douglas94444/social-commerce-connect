export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          tiktok_access_token: string | null
          tiktok_refresh_token: string | null
          tiktok_shop_id: string | null
          tiktok_token_expires_at: string | null
          updated_at: string
          user_id: string
          warehouse_address: Json | null
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          tiktok_access_token?: string | null
          tiktok_refresh_token?: string | null
          tiktok_shop_id?: string | null
          tiktok_token_expires_at?: string | null
          updated_at?: string
          user_id: string
          warehouse_address?: Json | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          tiktok_access_token?: string | null
          tiktok_refresh_token?: string | null
          tiktok_shop_id?: string | null
          tiktok_token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          warehouse_address?: Json | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          brand_id: string
          carrier: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          delivered_at: string | null
          id: string
          items: Json
          melhor_envio_order_id: string | null
          order_number: string | null
          raw_payload: Json | null
          shipped_at: string | null
          shipping_address: Json
          shipping_cost: number
          shipping_label_url: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tiktok_order_id: string
          total: number
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          carrier?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          delivered_at?: string | null
          id?: string
          items?: Json
          melhor_envio_order_id?: string | null
          order_number?: string | null
          raw_payload?: Json | null
          shipped_at?: string | null
          shipping_address: Json
          shipping_cost?: number
          shipping_label_url?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tiktok_order_id: string
          total?: number
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          carrier?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivered_at?: string | null
          id?: string
          items?: Json
          melhor_envio_order_id?: string | null
          order_number?: string | null
          raw_payload?: Json | null
          shipped_at?: string | null
          shipping_address?: Json
          shipping_cost?: number
          shipping_label_url?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tiktok_order_id?: string
          total?: number
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          brand_id: string
          created_at: string
          description: string | null
          height_cm: number
          id: string
          image_url: string | null
          last_synced_at: string | null
          length_cm: number
          price: number
          sku: string
          stock: number
          tiktok_product_id: string | null
          title: string
          updated_at: string
          weight_grams: number
          width_cm: number
        }
        Insert: {
          active?: boolean
          brand_id: string
          created_at?: string
          description?: string | null
          height_cm?: number
          id?: string
          image_url?: string | null
          last_synced_at?: string | null
          length_cm?: number
          price?: number
          sku: string
          stock?: number
          tiktok_product_id?: string | null
          title: string
          updated_at?: string
          weight_grams?: number
          width_cm?: number
        }
        Update: {
          active?: boolean
          brand_id?: string
          created_at?: string
          description?: string | null
          height_cm?: number
          id?: string
          image_url?: string | null
          last_synced_at?: string | null
          length_cm?: number
          price?: number
          sku?: string
          stock?: number
          tiktok_product_id?: string | null
          title?: string
          updated_at?: string
          weight_grams?: number
          width_cm?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          brand_id: string | null
          created_at: string
          error: string | null
          id: string
          message: string | null
          order_id: string | null
          payload: Json | null
          status: Database["public"]["Enums"]["sync_log_status"]
          type: Database["public"]["Enums"]["sync_log_type"]
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          message?: string | null
          order_id?: string | null
          payload?: Json | null
          status: Database["public"]["Enums"]["sync_log_status"]
          type: Database["public"]["Enums"]["sync_log_type"]
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          message?: string | null
          order_id?: string | null
          payload?: Json | null
          status?: Database["public"]["Enums"]["sync_log_status"]
          type?: Database["public"]["Enums"]["sync_log_type"]
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "brand_owner" | "admin"
      order_status:
        | "pending"
        | "awaiting_shipment"
        | "label_generated"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "failed"
      sync_log_status: "success" | "error" | "pending"
      sync_log_type:
        | "tiktok_oauth"
        | "tiktok_product_sync"
        | "tiktok_stock_sync"
        | "tiktok_order_webhook"
        | "tiktok_rts"
        | "melhor_envio_quote"
        | "melhor_envio_label"
        | "email_notification"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["brand_owner", "admin"],
      order_status: [
        "pending",
        "awaiting_shipment",
        "label_generated",
        "shipped",
        "delivered",
        "cancelled",
        "failed",
      ],
      sync_log_status: ["success", "error", "pending"],
      sync_log_type: [
        "tiktok_oauth",
        "tiktok_product_sync",
        "tiktok_stock_sync",
        "tiktok_order_webhook",
        "tiktok_rts",
        "melhor_envio_quote",
        "melhor_envio_label",
        "email_notification",
      ],
    },
  },
} as const
