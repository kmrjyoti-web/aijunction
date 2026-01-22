using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.InventoryService.Product;

[Table("Product", Schema = "INV.MS")]
public class ProductMaster: MasterBaseEntity
{
    [Key]
    [Column("product_unique_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public required string ProductUniqueId { get; set; }
    [Column("product_global_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ProductGlobalId { get; set; }
    [Column("product_offline_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ProductOfflineId { get; set; }
    [Column("user_product_code")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? UserProductCode { get; set; }
    [Column("sys_product_code")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? SysProductCode { get; set; }
    [Column("product_image_json")]
    public string? ProductImageJson { get; set; }
    [Column("product_description_json")]
    [StringLength(500)]
    [Unicode(false)]
    public string? ProductDescriptionJson { get; set; }
    [Column("product_description_detail")]
    public string? ProductDescriptionDetail { get; set; }
    [Column("master_product_global_id")]
    [StringLength(50)]
    [Unicode(false)]
    public string? MasterProductGlobalId { get; set; }
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
    [Column("product_heading")]
    [StringLength(500)]
    [Unicode(false)]
    public required string ProductHeading { get; set; }
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