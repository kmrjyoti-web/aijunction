// Domain/Entities/ContactService/Organization/CrmMstOrganizationEntity.cs

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AvinyaCrm.SqlData.Domain.Entities.CommonService;
using Microsoft.EntityFrameworkCore;

namespace AvinyaCrm.SqlData.Domain.Entities.ContactService.Organization
{
    [Table("Organization", Schema = "CRM.Mst")]
    [Index(nameof(UserOrganizationCode),   IsUnique = true, Name = "UX_MstOrg_user_org_code")]
    [Index(nameof(SystemOrganizationCode), IsUnique = true, Name = "UX_MstOrg_sys_org_code")]
    [Index(nameof(OrganizationName),                      Name = "IX_MstOrg_organization_name")]
    public class CrmMstOrganizationEntity : MasterBaseEntity
    {
        [Key]
        [Column("organization_unique_id")]
        [MaxLength(36)]
        [Unicode(false)]
        public string OrganizationUniqueId { get; set; } = Guid.NewGuid().ToString();

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

        [Column("master_organization_id")]
        [MaxLength(36)]
        [Unicode(false)]
        public string? MasterOrganizationId { get; set; }

        [Column("organization_branch_code")]
        [MaxLength(50)]
        [Unicode(false)]
        public string? OrganizationBranchCode { get; set; }

        [Column("system_organization_type_code")]    [MaxLength(100)] [Unicode(false)] public string? SystemOrganizationTypeCode { get; set; }
        [Column("system_organization_category_code")][MaxLength(100)] [Unicode(false)] public string? SystemOrganizationCategoryCode { get; set; }
        [Column("system_organization_group_code")]   [MaxLength(100)] [Unicode(false)] public string? SystemOrganizationGroupCode { get; set; }
        [Column("system_organization_status_code")]  [MaxLength(100)] [Unicode(false)] public string? SystemOrganizationStatusCode { get; set; }

        [Column("organization_type_id")]    [MaxLength(36)] [Unicode(false)] public string? OrganizationTypeId { get; set; }
        [Column("organization_category_id")][MaxLength(36)] [Unicode(false)] public string? OrganizationCategoryId { get; set; }
        [Column("organization_group_id")]   [MaxLength(36)] [Unicode(false)] public string? OrganizationGroupId { get; set; }
        [Column("organization_status_id")]  [MaxLength(36)] [Unicode(false)] public string? OrganizationStatusId { get; set; }

        [Column("business_trade_id")] [MaxLength(36)] [Unicode(false)] public string? BusinessTradeId { get; set; }
        [Column("business_type_id")]  [MaxLength(36)] [Unicode(false)] public string? BusinessTypeId  { get; set; }
        [Column("industry_id")]       [MaxLength(36)] [Unicode(false)] public string? IndustryId      { get; set; }

        [Column("owner_name")]        [MaxLength(100)] public string? OwnerName { get; set; }
        [Column("primary_mobile_no")] [MaxLength(20)]  [Unicode(false)] public string? PrimaryMobileNo  { get; set; }
        [Column("primary_phone_no")]  [MaxLength(20)]  [Unicode(false)] public string? PrimaryPhoneNo   { get; set; }
        [Column("primary_whatsapp_no")][MaxLength(20)] [Unicode(false)] public string? PrimaryWhatsappNo{ get; set; }
        [Column("primary_email_id")]  [MaxLength(100)] public string? PrimaryEmailId { get; set; }
        [Column("primary_website")]   [MaxLength(100)] [Unicode(false)] public string? PrimaryWebsite   { get; set; }
        [Column("primary_skype_id")]  [MaxLength(50)]  [Unicode(false)] public string? PrimarySkypeId   { get; set; }

        [Column("licence_no")]          [MaxLength(50)] [Unicode(false)] public string? LicenceNo          { get; set; }
        [Column("gst_registration_type")][MaxLength(50)][Unicode(false)] public string? GstRegistrationType { get; set; }
        [Column("tax_head")]            [MaxLength(50)] [Unicode(false)] public string? TaxHead             { get; set; }
        [Column("gst_state_code")]      [MaxLength(10)] [Unicode(false)] public string? GstStateCode        { get; set; }
        [Column("ledger_type_code")]    [MaxLength(50)] [Unicode(false)] public string? LedgerTypeCode      { get; set; }
        [Column("gst_no")]              [MaxLength(50)] [Unicode(false)] public string? GstNo               { get; set; }
        [Column("pan_no")]              [MaxLength(50)] [Unicode(false)] public string? PanNo               { get; set; }
        [Column("organization_system_code")] [MaxLength(50)] [Unicode(false)] public string? OrganizationSystemCode { get; set; }

        [Column("location")]  [MaxLength(100)] public string? Location  { get; set; }
        [Column("pin_code")]  [MaxLength(10)]  [Unicode(false)] public string? PinCode   { get; set; }

        [Column("organization_licence_no")] [MaxLength(50)] [Unicode(false)] public string? OrganizationLicenceNo { get; set; }
        [Column("is_incomplete_data")] public bool?   IsIncompleteData { get; set; }
        [Column("no_off_employee")]   public int?    NoOffEmployee    { get; set; }
        [Column("annual_revenue")]    [Precision(18,2)] public decimal? AnnualRevenue { get; set; }
        [Column("annual_revenue_currency_code")] [MaxLength(5)] [Unicode(false)] public string? AnnualRevenueCurrencyCode { get; set; }
        [Column("organization_status")] [MaxLength(50)] public string? OrganizationStatus { get; set; }
        [Column("other_field_a")]
        [MaxLength(100)]
        [Unicode(false)]
        public string? OtherFieldA { get; set; }
        [Column("other_field_b")]
        [MaxLength(100)]
        [Unicode(false)]
        public string? OtherFieldB { get; set; }
        [Column("other_field_c")]
        [MaxLength(100)]
        [Unicode(false)]
        public string? OtherFieldC { get; set; }
        [Column("other_field_d")]
        [MaxLength(100)]
        [Unicode(false)]
        public string? OtherFieldD { get; set; }
        [Column("other_field_e")]
        [MaxLength(100)]
        [Unicode(false)]
        public string? OtherFieldE { get; set; }
        [Column("config_json")]
        [Unicode(false)]
        public string? ConfigJson { get; set; }
        
    }
}