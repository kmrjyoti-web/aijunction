using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.InventoryService.Brand
{
    [Table("Brand", Schema = "INV.Mst")] // 🔁 adjust table name if needed
    public class BrandMasterEntity : MasterBaseEntity
    {
        [Key]
        [Column("brand_Unique_id")]
        [MaxLength(250)]
        [Unicode(false)]
        public string BrandUniqueId { get; set; } = Guid.NewGuid().ToString();
        [Column("user_brand_code")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? UserBrandCode { get; set; }
        [Column("sys_brand_code")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? SysBrandCode { get; set; }
        [Required]
        [Column("brand_name")]
        [MaxLength(150)]
        [Unicode(false)]
        public string BrandName { get; set; } = null!;
        [Column("brand_image_json")]
        public string? BrandImageJson { get; set; } = null!;
        [Column("brand_description")]
        [MaxLength(500)]
        [Unicode(false)]
        public string? BrandDescription { get; set; } = null!;
        [Column("brand_short_description")]
        [MaxLength(2000)]
        [Unicode(false)]
        public string? BrandShortDescription { get; set; } = null!;
        [Column("master_brand_unique_id")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? MasterBrandUniqueId { get; set; }
        [Column("filter_detail_json")]
        public string? FilterDetailJson { get; set; }
        [Column("brand_product_series")]
        public int? BrandProductSeries { get; set; }
        [Column("minimum_margin")]
        public decimal? MinimumMargin { get; set; }
        [Column("minimum_discount")]
        public decimal? MinimumDiscount { get; set; }
        [Column("dump_days")]
        public int? DumpDays { get; set; }
        [Column("is_prohibit")]
        public byte? IsProhibit { get; set; }
        [Column("is_incomplete_data")]
        public byte? IsIncompleteData { get; set; }
        [Column("config_json")]
        [Unicode(false)]
        public string? ConfigJson { get; set; }
       
    }
}