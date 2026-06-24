export interface Database {
  public: {
    Tables: {
      auth_users: {
        Row: {
          id: string;
          email: string;
          password: string;
          name: string;
          type: string;
          full_name: string | null;
          company_name: string | null;
          phone_number: string | null;
          country: string | null;
          profile_picture: string | null;
          bio: string | null;
          skills: string[] | null;
          experience: string | null;
          education: string | null;
          is_premium: boolean | null;
          is_admin: boolean | null;
          connections: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          password: string;
          name: string;
          type: string;
          full_name?: string | null;
          company_name?: string | null;
          phone_number?: string | null;
          country?: string | null;
          profile_picture?: string | null;
          bio?: string | null;
          skills?: string[] | null;
          experience?: string | null;
          education?: string | null;
          is_premium?: boolean | null;
          is_admin?: boolean | null;
          connections?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          name?: string;
          type?: string;
          full_name?: string | null;
          company_name?: string | null;
          phone_number?: string | null;
          country?: string | null;
          profile_picture?: string | null;
          bio?: string | null;
          skills?: string[] | null;
          experience?: string | null;
          education?: string | null;
          is_premium?: boolean | null;
          is_admin?: boolean | null;
          connections?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      professional_applications: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          location: string | null;
          title: string | null;
          experience: string | null;
          skills: string[] | null;
          status: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          location?: string | null;
          title?: string | null;
          experience?: string | null;
          skills?: string[] | null;
          status?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          location?: string | null;
          title?: string | null;
          experience?: string | null;
          skills?: string[] | null;
          status?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      recruiter_applications: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          location: string | null;
          status: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          location?: string | null;
          status?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          location?: string | null;
          status?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      company_applications: {
        Row: {
          id: string;
          company_name: string;
          contact_person: string | null;
          email: string;
          phone: string | null;
          location: string | null;
          industry: string | null;
          website: string | null;
          registration_number: string | null;
          status: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          company_name: string;
          contact_person?: string | null;
          email: string;
          phone?: string | null;
          location?: string | null;
          industry?: string | null;
          website?: string | null;
          registration_number?: string | null;
          status?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_name?: string;
          contact_person?: string | null;
          email?: string;
          phone?: string | null;
          location?: string | null;
          industry?: string | null;
          website?: string | null;
          registration_number?: string | null;
          status?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          company: string;
          company_logo: string | null;
          location: string | null;
          type: string;
          salary: string | null;
          description: string | null;
          requirements: string[] | null;
          posted_by: string;
          posted_at: string | null;
          applicants: number | null;
          status: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          title: string;
          company: string;
          company_logo?: string | null;
          location?: string | null;
          type: string;
          salary?: string | null;
          description?: string | null;
          requirements?: string[] | null;
          posted_by: string;
          posted_at?: string | null;
          applicants?: number | null;
          status?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          company?: string;
          company_logo?: string | null;
          location?: string | null;
          type?: string;
          salary?: string | null;
          description?: string | null;
          requirements?: string[] | null;
          posted_by?: string;
          posted_at?: string | null;
          applicants?: number | null;
          status?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      job_applications: {
        Row: {
          id: string;
          job_id: string;
          user_id: string;
          cover_letter: string | null;
          resume: string | null;
          applied_at: string | null;
          status: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          job_id: string;
          user_id: string;
          cover_letter?: string | null;
          resume?: string | null;
          applied_at?: string | null;
          status?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          user_id?: string;
          cover_letter?: string | null;
          resume?: string | null;
          applied_at?: string | null;
          status?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      job_applicants: {
        Row: {
          id: string;
          job_id: string;
          name: string;
          email: string;
          title: string | null;
          applied_at: string | null;
          status: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          job_id: string;
          name: string;
          email: string;
          title?: string | null;
          applied_at?: string | null;
          status?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          name?: string;
          email?: string;
          title?: string | null;
          applied_at?: string | null;
          status?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      connections: {
        Row: {
          id: string;
          user_id: string;
          connected_user_id: string;
          status: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          connected_user_id: string;
          status?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          connected_user_id?: string;
          status?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          author: Record<string, unknown>;
          content: string;
          image: string | null;
          timestamp: string | null;
          created_at: string | null;
          likes: number | null;
          comments: number | null;
          shares: number | null;
          liked_by: string[] | null;
        };
        Insert: {
          id: string;
          author_id: string;
          author: Record<string, unknown>;
          content: string;
          image?: string | null;
          timestamp?: string | null;
          created_at?: string | null;
          likes?: number | null;
          comments?: number | null;
          shares?: number | null;
          liked_by?: string[] | null;
        };
        Update: {
          id?: string;
          author_id?: string;
          author?: Record<string, unknown>;
          content?: string;
          image?: string | null;
          timestamp?: string | null;
          created_at?: string | null;
          likes?: number | null;
          comments?: number | null;
          shares?: number | null;
          liked_by?: string[] | null;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          participant_ids: string[];
          last_message: string | null;
          last_message_at: string | null;
          job_title: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          participant_ids: string[];
          last_message?: string | null;
          last_message_at?: string | null;
          job_title?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          participant_ids?: string[];
          last_message?: string | null;
          last_message_at?: string | null;
          job_title?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          created_at: string | null;
          read: boolean | null;
        };
        Insert: {
          id: string;
          conversation_id: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          created_at?: string | null;
          read?: boolean | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          recipient_id?: string;
          content?: string;
          created_at?: string | null;
          read?: boolean | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          created_at: string | null;
          read: boolean | null;
          related_id: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          created_at?: string | null;
          read?: boolean | null;
          related_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          description?: string;
          created_at?: string | null;
          read?: boolean | null;
          related_id?: string | null;
        };
        Relationships: [];
      };
      scheduled_calls: {
        Row: {
          id: string;
          caller_id: string;
          recipient_id: string;
          recipient_name: string | null;
          type: string;
          status: string;
          scheduled_at: string | null;
          duration: string | null;
          job_title: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          caller_id: string;
          recipient_id: string;
          recipient_name?: string | null;
          type: string;
          status: string;
          scheduled_at?: string | null;
          duration?: string | null;
          job_title?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          caller_id?: string;
          recipient_id?: string;
          recipient_name?: string | null;
          type?: string;
          status?: string;
          scheduled_at?: string | null;
          duration?: string | null;
          job_title?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
