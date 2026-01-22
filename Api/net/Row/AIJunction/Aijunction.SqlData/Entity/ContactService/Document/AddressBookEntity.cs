using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.ContactService.Document;

[Table("DocumentBook", Schema = "CS.Mst")]
public class DocumentBookEntity : MasterBaseEntity
{
    // 🔑 Primary Key
    [Key]
    [Column("document_book_unique_id")]
    [Unicode(false)] // ✅ Add this line
    [StringLength(36)]
    public required string DocumentBookUniqueId { get; set; }
    [Column("document_book_global_id")]
    [StringLength(100)]
    public string? DocumentBookGlobalId { get; set; }
    [Column("document_book_offline_id")]
    [StringLength(100)]
    public string? DocumentBookOfflineId { get; set; }
    [Column("document_type_code")]
    [StringLength(100)]
    public string? DocumentTypeCode { get; set; }
    [Column("document_global_id")]
    [StringLength(100)]
    public string? DocumentUniqueId { get; set; }
    // 🏷️ Address Type
    [Column("document_create_date")]
    public DateTime? DocumentCreateDate { get; set; }
    [Column("document_expiry_date")]
    public DateTime? DocumentExpiryDate { get; set; }
    [Column("document_no")]
    [StringLength(50)]
    public string? DocumentNo { get; set; }
    [Column("document_url")]
    [StringLength(50)]
    public string? DocumentUrl { get; set; }
    [Column("document_view_type")]
    [StringLength(50)]
    public string? DocumentViewType { get; set; }
    [Column("document_download_type")]
    [StringLength(50)]
    public string? DocumentDownloadType { get; set; }
    [Column("document_notification_type")]
    [StringLength(50)]
    public string? DocumentNotificationType { get; set; }
    [Column("config_json")]
    [Unicode(false)]
    public string? ConfigJson { get; set; }

    // 🔁 Optional: Navigation properties can be added here
}