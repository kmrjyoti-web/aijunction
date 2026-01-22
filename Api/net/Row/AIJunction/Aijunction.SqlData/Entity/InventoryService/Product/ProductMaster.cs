// using System.ComponentModel.DataAnnotations;
// using System.ComponentModel.DataAnnotations.Schema;
// using AvinyaCrm.SqlData.Domain.Entities.CommonService;
// using Microsoft.EntityFrameworkCore;
//
// namespace AvinyaCrm.SqlData.Domain.Entities.InventoryService;
//
// [Table("Product", Schema = "INV.MS")]
// public class ProductMaster: MasterBaseEntity
// {
//     [Key]
//     [Column("product_unique_id")]
//     [MaxLength(36)]
//     [Unicode(false)]
//     public string ProductUniqueId { get; set; } = Guid.NewGuid().ToString();
//     [Column("user_product_code")]
//     [MaxLength(50)]
//     [Unicode(false)]
//     public string? UserProductCode { get; set; }
//     [Column("sys_product_code")]
//     [MaxLength(50)]
//     [Unicode(false)]
//     public string? SysProductCode { get; set; }
//     [Column("product_image")]
//     public string? ProductImage { get; set; }
//     [Column("product_short_desiccation")]
//     [StringLength(500)]
//     [Unicode(false)]
//     public string? ProductShortDesiccation { get; set; }
//     [Column("product_desiccation")]
//     [StringLength(1500)]
//     [Unicode(false)]
//     public string? ProductDesiccation { get; set; }
//     [Column("master_product_Unique_id")]
//     [StringLength(50)]
//     [Unicode(false)]
//     public string? MasterProductUniqueId { get; set; }
//     [Column("is_child_status_code")]
//     public string? IsChildStatusCode { get; set; }
//     [Column("product_barcode")]
//     [StringLength(50)]
//     [Unicode(false)]
//     public string? ProductBarcode { get; set; }
//     [Column("master_product_barcode")]
//     [StringLength(50)]
//     [Unicode(false)]
//     public string? MasterProductBarcode { get; set; }
//     [Column("product_name")]
//     [StringLength(250)]
//     [Unicode(false)]
//     public required string ProductName { get; set; }
//     [Column("product_alias")]
//     [StringLength(250)]
//     [Unicode(false)]
//     public string? ProductAlias { get; set; }
//     [Column("product_name_without_spacial_char")]
//     [StringLength(250)]
//     [Unicode(false)]
//     public string? ProductNameWithoutSpacialChar { get; set; }
//     [Column("product_name_without_spacial_space")]
//     [StringLength(250)]
//     [Unicode(false)]
//     public string? ProductNameWithoutSpacialSpace { get; set; }
//      [Column("product_system_category_code")]
//     public string? ProductSystemCategoryCode { get; set; }
//     [Column("product_system_group_code")]
//     public string? ProductSystemGroupCode { get; set; }
//     [Column("product_system_rating_code")]
//     public string? ProductSystemRatingCode { get; set; }
//     [Column("product_system_source_code")]
//     public string? ProductSystemSourceCode { get; set; }
//     [Column("product_system_stage_code")]
//     public string? ProductSystemStageCode { get; set; }
//     [Column("product_system_status_code")]
//     public string? ProductSystemStatusCode { get; set; }
//     [Column("product_system_type_code")]
//     public string? ProductSystemTypeCode { get; set; }
//     [Column("product_category_code")]
//     public string? ProductCategoryCode { get; set; }
//     [Column("product_group_code")]
//     public string? ProductGroupCode { get; set; }
//     [Column("product_rating_code")]
//     public string? ProductRatingCode { get; set; }
//     [Column("product_source_code")]
//     public string? ProductSourceCode { get; set; }
//     [Column("product_stage_code")]
//     public string? ProductStageCode { get; set; }
//     [Column("product_status_code")]
//     public string? ProductStatusCode { get; set; }
//     [Column("product_type_code")]
//     public string? ProductTypeCode { get; set; }
//     [Column("product_color_code")]
//     public string? ProductColorCode { get; set; }
//     [Column("product_unit_code")]
//     public string? ProductUnitCode { get; set; }
//     [Column("product_size_code")]
//     public string? ProductSizeCode { get; set; }
//     [Column("product_tax_code")]
//     public string? ProductTaxCode { get; set; }
//     [Column("product_hsn_code")]
//     [StringLength(50)]
//     public required string ProductHsnCode { get; set; }
//     [Column("product_sgst", TypeName = "decimal(5, 2)")]
//     public decimal? ProductSgst { get; set; }
//     [Column("product_cgst", TypeName = "decimal(5, 2)")]
//     public decimal? ProductCgst { get; set; }
//     [Column("product_igst", TypeName = "decimal(5, 2)")]
//     public decimal? ProductIgst { get; set; }
//     [Column("product_ces", TypeName = "decimal(5, 2)")]
//     public decimal? ProductCes { get; set; }
//     [Column("tax_start_date")]
//     public DateTime? TaxStartDate { get; set; }
//     [Column("tax_end_date")]
//     public DateTime? TaxEndDate { get; set; }
//     [Column("tax_status")]
//     public string? TaxStatusCode { get; set; }
//     [Column("product_brand_id")]
//     public string? ProductBrandId { get; set; }
//     [Column("product_manufacturer_id")]
//     public string? ProductManufacturerId { get; set; }
//     [Column("product_cost", TypeName = "decimal(8, 2)")]
//     public decimal? ProductCost { get; set; }
//     [Column("product_mrp", TypeName = "decimal(8, 2)")]
//     public decimal? ProductMrp { get; set; }
//     [Column("product_purchase_rate", TypeName = "decimal(18, 2)")]
//     public decimal? ProductPurchaseRate { get; set; }
//     [Column("product_purchase_discount", TypeName = "decimal(18, 2)")]
//     public decimal? ProductPurchaseDiscount { get; set; }
//     [Column("product_discount", TypeName = "decimal(18, 4)")]
//     public decimal? ProductDiscount { get; set; }
//     [Column("product_sale_rate", TypeName = "decimal(18, 4)")]
//     public decimal? ProductSaleRate { get; set; }
//     [Column("is_return_allowed")]
//     public byte? IsReturnAllowed { get; set; }
//     [Column("sales_purchase_status_code")]
//     public string? SalesPurchaseStatusCode { get; set; }
//     [Column("is_allow_negative_stock")]
//     public byte? IsAllowNegativeStock { get; set; }
//     [Column("fix_discount_value", TypeName = "decimal(18, 4)")]
//     public decimal? FixDiscountValue { get; set; }
//     [Column("minimum_stock", TypeName = "decimal(18, 2)")]
//     public decimal? MinimumStock { get; set; }
//     [Column("maximum_stock", TypeName = "decimal(18, 2)")]
//     public decimal? MaximumStock { get; set; }
//     [Column("is_expiry_maintain")]
//     public byte? IsExpiryMaintain { get; set; }
//     [Column("product_life")]
//     public int? ProductLife { get; set; }
//     [Column("minimum_order_quantity", TypeName = "decimal(18, 4)")]
//     public decimal? MinimumOrderQuantity { get; set; }
//     [Column("minimum_order_value", TypeName = "decimal(18, 4)")]
//     public decimal? MinimumOrderValue { get; set; }
//     [Column("maximum_order_quantity", TypeName = "decimal(18, 4)")]
//     public decimal? MaximumOrderQuantity { get; set; }
//     [Column("maximum_order_value", TypeName = "decimal(18, 4)")]
//     public decimal? MaximumOrderValue { get; set; }
//     [Column("reorder_day")]
//     public int? ReorderDay { get; set; }
//     [Column("reorder_quantity", TypeName = "decimal(18, 4)")]
//     public decimal? ReorderQuantity { get; set; }
//     [Column("minimum_margin_per", TypeName = "decimal(5, 2)")]
//     public decimal? MinimumMarginPer { get; set; }
//     [Column("is_discount_allow")]
//     public byte? IsDiscountAllow { get; set; }
//     [Column("discount_per", TypeName = "decimal(5, 2)")]
//     public decimal? DiscountPer { get; set; }
//     [Column("maximum_discount_per", TypeName = "decimal(5, 2)")]
//     public decimal? MaximumDiscountPer { get; set; }
//     [Column("is_schedule")]
//     public byte? IsSchedule { get; set; }
//     [Column("is_schedule_h")]
//     public byte? IsScheduleH { get; set; }
//     [Column("is_schedule_h1")]
//     public byte? IsScheduleH1 { get; set; }
//     [Column("is_schedule_x")]
//     public byte? IsScheduleX { get; set; }
//     [Column("is_reported")]
//     public byte? IsReported { get; set; }
//     [Column("is_otc")]
//     public byte? IsOtc { get; set; }
//     [Column("is_narcotics")]
//     public byte? IsNarcotics { get; set; }
//     [Column("is_prohibited")]
//     public byte? IsProhibited { get; set; }
//     [Column("is_tbItem")]
//     public byte? IsTbItem { get; set; }
//     [Column("is_visibility")]
//     public byte? IsVisibility { get; set; }
//     [Column("is_alias")]
//     public byte? IsAlias { get; set; }
//     [Column("is_multicolor")]
//     public byte? IsMulticolor { get; set; }
//     [Column("is_multi_size")]
//     public byte? IsMultiSize { get; set; }
//     [Column("is_seasonal")]
//     public byte? IsSeasonal { get; set; }
//     [Column("is_design")]
//     public byte? IsDesign { get; set; }
//     [Column("is_multi_language")]
//     public byte? IsMultiLanguage { get; set; }
//     [Column("is_multi_material")]
//     public byte? IsMultiMaterial { get; set; }
//     [Column("is_multi_brand")]
//     public byte? IsMultiBrand { get; set; }
//     [Column("is_recurring_billing")]
//     public byte? IsRecurringBilling { get; set; }
//     [Column("recurring_billing_schedule_code")]
//     [StringLength(50)]
//     [Unicode(false)]
//     public string? RecurringBillingGlobalCode { get; set; }
//     [Column("is_row_product")]
//     public byte? IsRowProduct { get; set; }
//     [Column("is_service_base_product")]
//     public byte? IsServiceBaseProduct { get; set; }
//     [Column("is_required_licence")]
//     public byte? IsRequiredLicence { get; set; }
//     [Column("is_crm_product")]
//     public byte? IsCrmProduct { get; set; }
//     [Column("is_web")]
//     public byte? IsWeb { get; set; }
//     [Column("current_stock", TypeName = "decimal(18, 4)")]
//     public decimal? CurrentStock { get; set; }
//     [Column("is_incomplete_data")]
//     public byte? IsIncompleteData { get; set; }
//     [Column("product_operation_type")]
//     [StringLength(50)]
//     [Unicode(false)]
//     public string? ProductOperationType { get; set; }
// }

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AvinyaCrm.SqlData.Domain.Entities.CommonService;
using Microsoft.EntityFrameworkCore;

namespace AvinyaCrm.SqlData.Domain.Entities.InventoryService;

[Table("Product", Schema = "INV.MS")]
public class ProductMaster: MasterBaseEntity
{
    [Key]
    [Column("product_unique_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ProductUniqueId { get; set; } = Guid.NewGuid().ToString();
    [Column("user_product_code")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? UserProductCode { get; set; }
    [Column("sys_product_code")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? SysProductCode { get; set; }
    [Column("product_image")]
    public string? ProductImage { get; set; }
    [Column("product_short_description")]
    [StringLength(500)]
    [Unicode(false)]
    public string? ProductShortDescription { get; set; }
    [Column("product_description_detail")]
    public string? ProductDescriptionDetail { get; set; }
    [Column("master_product_Unique_id")]
    [StringLength(50)]
    [Unicode(false)]
    public string? MasterProductUniqueId { get; set; }
    [Column("is_child_status_code")]
    public string? IsChildStatusCode { get; set; }
    [Column("product_barcode")]
    [StringLength(50)]
    [Unicode(false)]
    public string? ProductBarcode { get; set; }
    [Column("master_product_barcode")]
    [StringLength(50)]
    [Unicode(false)]
    public string? MasterProductBarcode { get; set; }
    [Column("product_name")]
    [StringLength(250)]
    [Unicode(false)]
    public required string ProductName { get; set; }
    [Column("product_alias")]
    [StringLength(250)]
    [Unicode(false)]
    public string? ProductAlias { get; set; }
    [Column("product_unit_detail")]
    public string? ProductUnitDetail { get; set; }
    [Column("product_filter_detail")]
    public string? ProductFilterDetail { get; set; }
    [Column("product_variant_detail")]
    public string? ProductVariantDetail { get; set; }
    [Column("product_document_detail")]
    public string? ProductDocumentDetail { get; set; }
    [Column("product_tax_detail")]
    public string? ProductTaxDetail { get; set; }
    [Column("product_rate_detail")]
    public string? ProductRateDetail { get; set; }
    [Column("product_licence_detail")]
    public string? ProductLicenceDetail { get; set; }

    [Column("product_cost", TypeName = "decimal(8, 2)")]
    public decimal? ProductCost { get; set; } = 0m;

    [Column("product_mrp", TypeName = "decimal(8, 2)")]
    public decimal? ProductMrp { get; set; } = 0m;

    [Column("product_purchase_rate", TypeName = "decimal(18, 2)")]
    public decimal? ProductPurchaseRate { get; set; } = 0m;
    [Column("product_purchase_discount", TypeName = "decimal(18, 2)")]
    public decimal? ProductPurchaseDiscount { get; set; }
    [Column("product_discount", TypeName = "decimal(18, 4)")]
    public decimal? ProductDiscount { get; set; }

    [Column("product_sale_rate", TypeName = "decimal(18, 4)")]
    public decimal? ProductSaleRate { get; set; } = 0m;
    [Column("product_licence_charge", TypeName = "decimal(18, 4)")]
    public decimal? ProductLicenceCharge { get; set; } = 0m;
    [Column("product_amc_charge", TypeName = "decimal(18, 4)")]
    public decimal? ProductAmcCharge { get; set; } = 0m;
    [Column("product_implementation_charge_min", TypeName = "decimal(18, 4)")]
    public decimal? ProductImplementationChargeMin { get; set; } = 0m;
    [Column("product_implementation_charge_max", TypeName = "decimal(18, 4)")]
    public decimal? ProductImplementationChargeMax { get; set; } = 0m;
    [Column("licence_tenure")]
    public int? LicenceTenure { get; set; } = 0;
    [Column("is_return_allowed")]
    public byte? IsReturnAllowed { get; set; }
    [Column("sales_purchase_status_code")]
    public string? SalesPurchaseStatusCode { get; set; }
    [Column("is_allow_negative_stock")]
    public byte? IsAllowNegativeStock { get; set; }
    [Column("fix_discount_value", TypeName = "decimal(18, 4)")]
    public decimal? FixDiscountValue { get; set; }
    [Column("minimum_stock", TypeName = "decimal(18, 2)")]
    public decimal? MinimumStock { get; set; }
    [Column("maximum_stock", TypeName = "decimal(18, 2)")]
    public decimal? MaximumStock { get; set; }
    [Column("is_expiry_maintain")]
    public byte? IsExpiryMaintain { get; set; }
    [Column("product_life")]
    public int? ProductLife { get; set; }
    [Column("minimum_order_quantity", TypeName = "decimal(18, 4)")]
    public decimal? MinimumOrderQuantity { get; set; }
    [Column("minimum_order_value", TypeName = "decimal(18, 4)")]
    public decimal? MinimumOrderValue { get; set; }
    [Column("maximum_order_quantity", TypeName = "decimal(18, 4)")]
    public decimal? MaximumOrderQuantity { get; set; }
    [Column("maximum_order_value", TypeName = "decimal(18, 4)")]
    public decimal? MaximumOrderValue { get; set; }
    [Column("reorder_day")]
    public int? ReorderDay { get; set; }
    [Column("reorder_quantity", TypeName = "decimal(18, 4)")]
    public decimal? ReorderQuantity { get; set; }
    [Column("minimum_margin_per", TypeName = "decimal(5, 2)")]
    public decimal? MinimumMarginPer { get; set; }
    [Column("is_discount_allow")]
    public byte? IsDiscountAllow { get; set; }
    [Column("discount_per", TypeName = "decimal(5, 2)")]
    public decimal? DiscountPer { get; set; }
    [Column("maximum_discount_per", TypeName = "decimal(5, 2)")]
    public decimal? MaximumDiscountPer { get; set; }
    [Column("is_schedule")]
    public byte? IsSchedule { get; set; }
    [Column("is_schedule_h")]
    public byte? IsScheduleH { get; set; }
    [Column("is_schedule_h1")]
    public byte? IsScheduleH1 { get; set; }
    [Column("is_schedule_x")]
    public byte? IsScheduleX { get; set; }
    [Column("is_reported")]
    public byte? IsReported { get; set; }
    [Column("is_otc")]
    public byte? IsOtc { get; set; }
    [Column("is_narcotics")]
    public byte? IsNarcotics { get; set; }
    [Column("is_prohibited")]
    public byte? IsProhibited { get; set; }
    [Column("is_tbItem")]
    public byte? IsTbItem { get; set; }
    [Column("is_visibility")]
    public byte? IsVisibility { get; set; }
    [Column("is_alias")]
    public byte? IsAlias { get; set; }
    [Column("is_multicolor")]
    public byte? IsMulticolor { get; set; }
    [Column("is_multi_size")]
    public byte? IsMultiSize { get; set; }
    [Column("is_seasonal")]
    public byte? IsSeasonal { get; set; }
    [Column("is_design")]
    public byte? IsDesign { get; set; }
    [Column("is_multi_language")]
    public byte? IsMultiLanguage { get; set; }
    [Column("is_multi_material")]
    public byte? IsMultiMaterial { get; set; }
    [Column("is_multi_brand")]
    public byte? IsMultiBrand { get; set; }
    [Column("is_recurring_billing")]
    public byte? IsRecurringBilling { get; set; }
    [Column("recurring_billing_schedule_code")]
    [StringLength(50)]
    [Unicode(false)]
    public string? RecurringBillingGlobalCode { get; set; }
    [Column("is_row_product")]
    public byte? IsRowProduct { get; set; }
    [Column("is_service_base_product")]
    public byte? IsServiceBaseProduct { get; set; }
    [Column("is_required_licence")]
    public byte? IsRequiredLicence { get; set; }
    [Column("is_crm_product")]
    public byte? IsCrmProduct { get; set; }
    [Column("is_web")]
    public byte? IsWeb { get; set; }

    [Column("current_stock", TypeName = "decimal(18, 4)")]
    public decimal? CurrentStock { get; set; } = 0m;
    [Column("is_incomplete_data")]
    public byte? IsIncompleteData { get; set; }
    [Column("product_operation_type")]
    [StringLength(50)]
    [Unicode(false)]
    public string? ProductOperationType { get; set; }
}