import type { Logger } from "~/lib/logger.server";
import type { ServerSession } from "~/lib/types";

declare global {
  interface ImportMetaEnv {
    // client
    readonly VITE_CLOUDINARY_CLOUD_NAME: string;
    readonly VITE_FROM_EMAIL: string;
    readonly VITE_APP_URL: string;
    readonly VITE_BETTER_AUTH_URL: string;
    readonly VITE_COMPANY_EMAIL: string;
    readonly VITE_DARK_LOGO_URL: string;
    readonly VITE_INPOST_API_KEY: string;
    readonly VITE_INPOST_ENVIROMENT: string;
    readonly VITE_INSTAGRAM_URL: string;
    readonly VITE_LIGHT_LOGO_URL: string;
    readonly VITE_MAPBOX_API_KEY: string;
    readonly VITE_MAPBOX_ENVIRONMENT: string;
    readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
    readonly VITE_TIKTOK_URL: string;
    readonly VITE_YOUTUBE_URL: string;
    // client prod only
    readonly VITE_GOOGLE_VERIFICATION: string | undefined;
    readonly VITE_GOOGLE_ANALYTICS_ID: string | undefined;
  }
}
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // client
      readonly VITE_CLOUDINARY_CLOUD_NAME: string;
      readonly VITE_FROM_EMAIL: string;
      readonly VITE_APP_URL: string;
      readonly VITE_BETTER_AUTH_URL: string;
      readonly VITE_COMPANY_EMAIL: string;
      readonly VITE_DARK_LOGO_URL: string;
      readonly VITE_INPOST_API_KEY: string;
      readonly VITE_INPOST_ENVIROMENT: string;
      readonly VITE_INSTAGRAM_URL: string;
      readonly VITE_LIGHT_LOGO_URL: string;
      readonly VITE_MAPBOX_API_KEY: string;
      readonly VITE_MAPBOX_ENVIRONMENT: string;
      readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
      readonly VITE_TIKTOK_URL: string;
      readonly VITE_YOUTUBE_URL: string;
      // client prod only
      readonly VITE_GOOGLE_VERIFICATION: string | undefined;
      readonly VITE_GOOGLE_ANALYTICS_ID: string | undefined;
      // server
      readonly BETTER_AUTH_SECRET: string;
      readonly BETTER_STACK_ENDPOINT: string;
      readonly BETTER_STACK_SOURCE_TOKEN: string;
      readonly CLOUDINARY_API_KEY: string;
      readonly CLOUDINARY_API_SECRET: string;
      readonly DATABASE_URL: string;
      readonly FACEBOOK_CLIENT_ID: string;
      readonly FACEBOOK_CLIENT_SECRET: string;
      readonly GOOGLE_CLIENT_ID: string;
      readonly GOOGLE_CLIENT_SECRET: string;
      readonly RESEND_API_KEY: string;
      readonly STRIPE_SECRET_KEY: string;
      readonly STRIPE_WEBHOOK_SECRET: string;
    }
  }
}

export type GTagItem = {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  quantity?: number;
};

export type EnhancedGTagItem = GTagItem & {
  creative_name?: string;
  creative_slot?: string;
  promotion_id?: string;
  promotion_name?: string;
};

type Args = {
  consent: any;
  event: {
    add_payment_info: {
      currency: string;
      value: number;
      coupon?: string;
      payment_type?: string;
      items: Array<GTagItem>;
    };
    add_shipping_info: {
      currency: string;
      value: number;
      coupon?: string;
      shipping_tier?: string;
      items: Array<GTagItem>;
    };
    add_to_cart: {
      currency: string;
      value: number;
      items: Array<GTagItem>;
    };
    add_to_wishlist: {
      currency: string;
      value: number;
      items: Array<GTagItem>;
    };
    begin_checkout: {
      currency: string;
      value: number;
      coupon?: string;
      items: Array<GTagItem>;
    };
    close_convert_lead: {
      currency: string;
      value: number;
    };
    close_unconvert_lead: {
      currency: string;
      value: number;
      unconvert_lead_reason?: string;
    };
    disqualify_lead: {
      currency: string;
      value: number;
      disqualified_lead_reason?: string;
    };
    exception: {
      description?: string;
      fatal?: boolean;
    };
    generate_lead: {
      currency: string;
      value: number;
      lead_source?: string;
    };
    login: {
      method?: string;
    };
    page_view: {
      page_location?: string;
      client_id?: string;
      language?: string;
      page_encoding?: string;
      page_title?: string;
      user_agent?: string;
    };
    purchase: {
      currency: string;
      value: number;
      customer_type?: "new" | "returning";
      transaction_id: string;
      coupon?: string;
      shipping?: number;
      tax?: number;
      items: Array<GTagItem>;
    };
    qualify_lead: {
      currency: string;
      value: number;
    };
    refund: {
      currency: string;
      transaction_id: string;
      value: number;
      coupon?: string;
      shipping?: number;
      tax?: number;
      items: Array<GTagItem>;
    };
    remove_from_cart: {
      currency: string;
      value: number;
      items: Array<GTagItem>;
    };
    search: {
      search_term: string;
    };
    select_content: {
      content_type?: string;
      content_id?: string;
    };
    select_item: {
      item_list_id?: string;
      item_list_name?: string;
      items: Array<GTagItem>;
    };
    select_promotion: {
      creative_name?: string;
      creative_slot?: string;
      promotion_id?: string;
      promotion_name?: string;
      items: Array<EnhancedGTagItem>;
    };
    share: {
      method?: string;
      content_type?: string;
      item_id?: string;
    };
    sign_up: {
      method?: string;
    };
    view_cart: {
      currency: string;
      value: number;
      items: Array<GTagItem>;
    };
    view_item: {
      currency: string;
      value: number;
      items: Array<GTagItem>;
    };
    view_item_list: {
      currency: string;
      item_list_id?: string;
      item_list_name?: string;
      items: Array<GTagItem>;
    };
    view_promotion: {
      creative_name?: string;
      creative_slot?: string;
      promotion_id?: string;
      promotion_name?: string;
      items: Array<EnhancedGTagItem>;
    };
    view_search_results: {
      search_term?: string;
    };
    working_lead: {
      currency: string;
      value: number;
      lead_status?: string;
    };
  };
};

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: <TArg1 extends keyof Args, TArg2 extends keyof Args[TArg1]>(
      arg1: TArg1,
      arg2: TArg2,
      data: Args[TArg1][TArg2]
    ) => void;
  }
}

// This is the magic "bridge" for React Router v7 types
declare module "react-router" {
  interface AppLoadContext {
    logger: Logger;
    session: ServerSession | null;
  }
}

export {};
