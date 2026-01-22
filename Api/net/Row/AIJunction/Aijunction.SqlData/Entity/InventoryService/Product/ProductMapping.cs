using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.InventoryService.Product;
[Table("ProductMapping", Schema = "INV.MAP")]
public class ProductMappingEntity : MasterBaseEntity
{
    [Key]
    [Column("product_mapping_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ProductMappingId { get; set; } = Guid.NewGuid().ToString();
    [Column("master_Product_global_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? MasterProductGlobalId { get; set; }
    [Column("child_Product_global_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ChildProductGlobalId { get; set; }
    [Required]
    [Column("mapping_type")]
    [MaxLength(50)]
    public string MappingType { get; set; } = null!;
   
}