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

type ConsentArgs = {
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
  analytics_storage: "granted" | "denied";
  wait_for_update: number;
};

type Args = {
  config: {
    default: ConsentArgs;
    update: ConsentArgs;
  };
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
      items: Array<
        GTagItem & {
          creative_name?: string;
          creative_slot?: string;
          promotion_id?: string;
          promotion_name?: string;
        }
      >;
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
      items: Array<
        GTagItem & {
          creative_name?: string;
          creative_slot?: string;
          promotion_id?: string;
          promotion_name?: string;
        }
      >;
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

export {};
