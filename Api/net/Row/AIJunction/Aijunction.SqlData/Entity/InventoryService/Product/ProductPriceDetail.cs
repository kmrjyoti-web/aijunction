using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.InventoryService.Product;

[Table("ProductPriceDetail", Schema = "INV.MS")]
public class ProductPriceDetail: MasterBaseEntity
{
    [Key]
    [Column("product_price_global_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ProductPriceGlobalId { get; set; } = Guid.NewGuid().ToString();
    [Column("product_global_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? ProductGlobalId { get; set; }
    [Column("rate_code")]
    public string? RateCode { get; set; }

    [Column("rate", TypeName = "decimal(18, 4)")]
    public decimal? Rate { get; set; }

    [Column("offer_discount_status")]
    public string? OfferDiscountStatus { get; set; }
   
}