using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.InventoryService.Product;
[Table("ProductUnitDetail", Schema = "INV.MS")]
public class ProductUnitEntity : MasterBaseEntity
{
    [Key]
    [Column("product_unit_global_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ProductUnitGlobalId { get; set; } = Guid.NewGuid().ToString();
    [Column("product_global_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ProductGlobalId { get; set; }
    [Required]
    [Column("unit_global_id")]
    [MaxLength(50)]
    public string UnitGlobalId { get; set; } = null!;
    [Column("is_primary_unit")]
    [MaxLength(50)]
    public string IsPrimaryUnit { get; set; } = null!;
    [Column("unit_conv")]  public decimal UnitConv { get; set; } = 0;
    
}