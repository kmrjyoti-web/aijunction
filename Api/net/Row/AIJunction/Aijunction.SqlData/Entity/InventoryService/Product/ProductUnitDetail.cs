using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AvinyaCrm.SqlData.Domain.Entities.CommonService;
using Microsoft.EntityFrameworkCore;

namespace AvinyaCrm.SqlData.Domain.Entities.InventoryService;
[Table("ProductUnitDetail", Schema = "INV.MS")]
public class ProductUnitEntity : MasterBaseEntity
{
    [Key]
    [Column("product_unit_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ProductUnitId { get; set; } = Guid.NewGuid().ToString();
    [Column("product_uniq_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ProductUniqId { get; set; }
    [Required]
    [Column("unit_unique_id")]
    [MaxLength(50)]
    public string UnitUniqueId { get; set; } = null!;
    [Column("is_primary_unit")]
    [MaxLength(50)]
    public string IsPrimaryUnit { get; set; } = null!;
    [Column("unit_conv")]  public decimal UnitConv { get; set; } = 0;
    
}