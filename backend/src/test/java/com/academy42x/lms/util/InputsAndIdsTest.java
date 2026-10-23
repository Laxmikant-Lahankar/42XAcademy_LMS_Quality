package com.academy42x.lms.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.academy42x.lms.dto.ProgressDto;
import com.academy42x.lms.exception.ApiException;
import org.junit.jupiter.api.Test;

/** Fast unit tests for the small helpers (no database needed). */
class InputsAndIdsTest {

    @Test
    void courseCodeBecomesReadableId() {
        assertEquals("sap-sd", Ids.slugify("SAP-SD"));
        assertEquals("power-bi-2026", Ids.slugify("  Power BI 2026 "));
    }

    @Test
    void numbersFromFormsAreAccepted() {
        assertEquals(12, Inputs.toInt("12", 0));
        assertEquals(45, Inputs.toInt(45, 0));
        assertEquals(7, Inputs.toInt("", 7));
        assertEquals(7, Inputs.toInt(null, 7));
        assertThrows(ApiException.class, () -> Inputs.toInt("abc", 0));
    }

    @Test
    void requiredTextIsTrimmedAndChecked() {
        assertEquals("SAP ABAP", Inputs.requireText("  SAP ABAP ", "Title"));
        ApiException error = assertThrows(ApiException.class, () -> Inputs.requireText("  ", "Title"));
        assertEquals("Title is required.", error.getMessage());
    }

    @Test
    void onlyAllowedValuesPass() {
        assertEquals("Draft", Inputs.oneOf(null, "Draft", "Published", "Draft"));
        assertEquals("Published", Inputs.oneOf("Published", "Draft", "Published", "Draft"));
        assertThrows(ApiException.class, () -> Inputs.oneOf("Archived", "Draft", "Published", "Draft"));
    }

    @Test
    void progressPercentIsRounded() {
        assertEquals(new ProgressDto(5, 11, 45), ProgressDto.of(5, 11));
        assertEquals(new ProgressDto(0, 0, 0), ProgressDto.of(0, 0));
        assertEquals(100, ProgressDto.of(12, 12).percent());
    }
}
