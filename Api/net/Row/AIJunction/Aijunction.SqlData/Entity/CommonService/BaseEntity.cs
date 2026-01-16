using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AvinyaCrm.SqlData.Domain.Entities.CommonService;



public  class MasterBaseEntity
{
    [Column("is_active")]
    public bool? IsActive { get; set; } = true;
    [Column("is_system_field")]
    public bool IsSystemField { get; set; } = false;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;

    [Column("created_by")]
    [StringLength(30)]
    public string? CreatedBy { get; set; }

    [Column("created_at", TypeName = "datetime2")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_by")]
    [StringLength(30)]
    public string? UpdatedBy { get; set; }

    [Column("updated_at", TypeName = "datetime2")]
    public DateTime? UpdatedAt { get; set; }

    [Column("deleted_by")]
    [StringLength(30)]
    public string? DeletedBy { get; set; }

    [Column("deleted_at", TypeName = "datetime2")]
    public DateTime? DeletedAt { get; set; }

    [Column("session_id")]
    [StringLength(50)]
    public string? SessionId { get; set; }
    [Column("company_code")]
    [StringLength(50)]
    public string? CompanyCode { get; set; }
    [Column("branch_code")]
    [StringLength(50)]
    public string? BranchCode { get; set; }
    [Column("location_code")]
    [StringLength(50)]
    public string? LocationCode { get; set; }
    
    
}
