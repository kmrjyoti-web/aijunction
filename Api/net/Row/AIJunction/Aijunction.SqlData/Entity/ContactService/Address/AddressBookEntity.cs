using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.ContactService.Address;

[Table("Address", Schema = "CRM.Mst")]
public class CrmMstAddressEntity : MasterBaseEntity
{
    // 🔑 Primary Key
    [Key]
    [Column("address_uniq_id")]
    [Unicode(false)] // ✅ Add this line
    [StringLength(36)]
    public required string AddressUniqId { get; set; }

    // 🔗 Related Entity Identifiers
    [Column("row_contact_id")]
    [StringLength(36)]
    public string? RowContactId { get; set; }

    [Column("contact_book_id")]
    [StringLength(36)]
    public string? ContactBookId { get; set; }

    [Column("contact_person_id")]
    [StringLength(36)]
    public string? ContactPersonId { get; set; }

    [Column("company_unique_id")]
    [StringLength(36)]
    public string? CompanyUniqueId { get; set; }

    // 🏷️ Address Type
    [Column("address_type_code")]
    [StringLength(20)]
    public string? AddressTypeCode { get; set; }

    // 📍 Address Lines
    [Column("address1")]
    [StringLength(250)]
    public string? Address1 { get; set; }

    [Column("address2")]
    [StringLength(250)]
    public string? Address2 { get; set; }

    [Column("address3")]
    [StringLength(250)]
    public string? Address3 { get; set; }

    // 🧭 Location Details
    [Column("pin_code")]
    [StringLength(10)]
    public string? PinCode { get; set; }

    [Column("location")]
    [StringLength(100)]
    public string? Location { get; set; }

    [Column("city")]
    [StringLength(100)]
    public string? City { get; set; }

    [Column("state")]
    [StringLength(100)]
    public string? State { get; set; }

    [Column("country")]
    [StringLength(100)]
    public string? Country { get; set; }

    [Column("continent")]
    [StringLength(100)]
    public string? Continent { get; set; }

    [Column("nearest_land_mark")]
    [StringLength(150)]
    public string? NearestLandMark { get; set; }

    // 🌐 Geo Location
    [Column("latitude")]
    [StringLength(50)]
    public string? Latitude { get; set; }

    [Column("longitude")]
    [StringLength(50)]
    public string? Longitude { get; set; }

    // 📅 Visit & Logistics Info
    [Column("visit_time_slot_code")]
    [StringLength(20)]
    public string? VisitTimeSlotCode { get; set; }

    [Column("holiday")]
    [StringLength(100)]
    public string? Holiday { get; set; }

    [Column("holiday_visit_status_code")]
    [StringLength(20)]
    public string? HolidayVisitStatusCode { get; set; }

    [Column("is_primary_address")]
    public bool? IsPrimaryAddress { get; set; }

    // 👤 Contact Person Info
    [Column("contact_person")]
    [StringLength(100)]
    public string? ContactPerson { get; set; }

    [Column("contact_detail")]
    [StringLength(100)]
    public string? ContactDetail { get; set; }

    // 🔧 Miscellaneous Fields
    [Column("other_field_a")]
    [StringLength(100)]
    public string? OtherFieldA { get; set; }

    [Column("other_field_b")]
    [StringLength(100)]
    public string? OtherFieldB { get; set; }

    [Column("other_field_c")]
    [StringLength(100)]
    public string? OtherFieldC { get; set; }

    [Column("other_field_d")]
    [StringLength(100)]
    public string? OtherFieldD { get; set; }

    [Column("other_field_e")]
    [StringLength(100)]
    public string? OtherFieldE { get; set; }

    [Column("other_field_f")]
    [StringLength(100)]
    public string? OtherFieldF { get; set; }

    [Column("config_json")]
    [Unicode(false)]
    public string? ConfigJson { get; set; }

    // 🔁 Optional: Navigation properties can be added here
}