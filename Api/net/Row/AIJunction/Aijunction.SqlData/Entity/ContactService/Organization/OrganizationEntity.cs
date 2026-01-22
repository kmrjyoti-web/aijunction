// Domain/Entities/ContactService/Organization/CrmMstOrganizationEntity.cs

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.ContactService.Organization
{
    [Table("Organization", Schema = "CS.Mst")]
    public class OrganizationEntity : MasterBaseEntity
    {
        [Key]
        [Column("organization_unique_id")]
        [MaxLength(36)]
        [Unicode(false)]
        public required string OrganizationUniqueId { get; set; } 
        [Column("organization_global_id")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? OrganizationGlobalId { get; set; }
        [Column("organization_offline_id")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? OrganizationOfflineId { get; set; }
        [Column("user_organization_code")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? UserOrganizationCode { get; set; }
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)] // or .Identity; EF treats either as store-generated
        [Column("system_organization_code")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? SystemOrganizationCode { get; set; }
        [Column("organization_name")]
        [MaxLength(150)]
        public string? OrganizationName { get; set; }
        [Column("master_organization_global_id")]
        [MaxLength(36)]
        [Unicode(false)]
        public string? MasterOrganizationGlobalId { get; set; }
        [Column("organization_branch_code")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? OrganizationBranchCode { get; set; }
        [Column("filter_detail_json")]
        public string? FilterDetailJson { get; set; }
        // ☎ Contact Info
        [Column("communication_detail_json")]
        public string? CommunicationDetailJson { get; set; }
        [Column("address_detail_json")]
        public string? AddressDetailJson { get; set; }
        [Column("document_detail_json")]
        public string? DocumentDetailJson { get; set; }
        [Column("owner_name")]        [MaxLength(100)] public string? OwnerName { get; set; }
        [Column("location")]  [MaxLength(100)] public string? Location  { get; set; }
        [Column("pin_code")]  [MaxLength(10)]  [Unicode(false)] public string? PinCode   { get; set; }
        [Column("is_incomplete_data")] public bool?   IsIncompleteData { get; set; }
        [Column("config_json")]
        [Unicode(false)]
        public string? ConfigJson { get; set; }
        
    }
}