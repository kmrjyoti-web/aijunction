using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.InventoryService.Product;

[Table("ProductTaxDetail", Schema = "INV.MS")]
public class ProductTaxDetail: MasterBaseEntity
{
    [Key]
    [Column("product_tax_global_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ProductTaxGlobalId { get; set; } = Guid.NewGuid().ToString();
    [Column("product_global_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? ProductGlobalId { get; set; }
    [Column("product_hsn_code")]
    [StringLength(50)]
    public required string ProductHsnCode { get; set; }
    [Column("product_sgst", TypeName = "decimal(5, 2)")]
    public decimal? ProductSgst { get; set; }
    [Column("product_cgst", TypeName = "decimal(5, 2)")]
    public decimal? ProductCgst { get; set; }
    [Column("product_igst", TypeName = "decimal(5, 2)")]
    public decimal? ProductIgst { get; set; }
    [Column("product_ces", TypeName = "decimal(5, 2)")]
    public decimal? ProductCes { get; set; }
    [Column("tax_start_date")]
    public required DateTime TaxStartDate { get; set; }
    [Column("tax_end_date")]
    public required DateTime TaxEndDate { get; set; }
    [Column("tax_status")]
    public required string TaxStatusCode { get; set; }
}