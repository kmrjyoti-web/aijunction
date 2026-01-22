using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AvinyaCrm.SqlData.Domain.Entities.CommonService;
using Microsoft.EntityFrameworkCore;

namespace AvinyaCrm.SqlData.Domain.Entities.InventoryService;
[Table("ProductFilterDetail", Schema = "INV.MS")]
public class ProductFilterEntity : MasterBaseEntity
{
    [Key]
    [Column("product_filter_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ProductFilterId { get; set; } = Guid.NewGuid().ToString();
    [Column("product_uniq_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ProductUniqId { get; set; }
    [Required]
    [Column("filter_type")]
    [MaxLength(50)]
    public string FilterType { get; set; } = null!;
    [Column("filter_unique_id")]
    [MaxLength(50)]
    public string FilterUniqueId { get; set; } = null!;
    [Column("filter_code")]
    [MaxLength(50)]
    public string FilterCode { get; set; } = null!;
    [Column("filter_status")]
    [MaxLength(50)]
    public string FilterStatus { get; set; } = null!;
    [Column("filter_name")]
    [MaxLength(250)]
    public string FilterName { get; set; } = null!;
   
}