using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AvinyaCrm.SqlData.Domain.Entities.CommonService;
using Microsoft.EntityFrameworkCore;

namespace AvinyaCrm.SqlData.Domain.Entities.InventoryService;
[Table("ProductMapping", Schema = "INV.MAP")]
public class ProductMappingEntity : MasterBaseEntity
{
    [Key]
    [Column("product_mapping_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ProductMappingId { get; set; } = Guid.NewGuid().ToString();
    [Column("master_Product_uniq_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? MasterProductUniqId { get; set; }
    [Column("child_Product_uniq_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ChildProductUniqId { get; set; }
    [Required]
    [Column("mapping_type")]
    [MaxLength(50)]
    public string MappingType { get; set; } = null!;
   
}