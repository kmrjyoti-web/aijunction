using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.ContactService.Manufacturer
{
    [Table("Manufacturer", Schema = "Mst")] // 🔁 adjust table name if needed
    public class BrandMasterEntity : MasterBaseEntity
    {
        [Key]
        [Column("manufacturer_Unique_id")]
        [MaxLength(250)]
        [Unicode(false)]
        public string ManufacturerUniqueId { get; set; } = Guid.NewGuid().ToString();
        [Column("user_manufacturer_code")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? UserManufacturerCode { get; set; }
        [Column("sys_manufacturer_code")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? SysManufacturerCode { get; set; }
        [Required]
        [Column("manufacturer_name")]
        [MaxLength(150)]
        [Unicode(false)]
        public string ManufacturerName { get; set; } = null!;
        [Column("manufacturer_image_json")]
        public string? BrandImageJson { get; set; } = null!;
        [Column("manufacturer_description")]
        [MaxLength(500)]
        [Unicode(false)]
        public string? BrandDescription { get; set; } = null!;
        [Column("manufacturer_short_description")]
        [MaxLength(2000)]
        [Unicode(false)]
        public string? ManufacturerShortDescription { get; set; } = null!;
        [Column("master_manufacturer_unique_id")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? MasterManufacturerUniqueId { get; set; }
        [Column("filter_detail_json")]
        public string? FilterDetailJson { get; set; }
        [Column("manufacturer_product_series")]
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