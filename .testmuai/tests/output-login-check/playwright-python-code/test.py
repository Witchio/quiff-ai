import os
import testmu
from testmu import expect, var, set_var
from playwright.async_api import Page

testmu.configure(
    build="da42cf10-89b7-4f61-9094-830df87e28b4",
    name="Verify Login Functionality and Error Handling",
    tc_id="TC-1",
    network=os.getenv("NETWORK", "false").lower() == "true",
    variables={"successful_login_check": "true", "welcome_success_state_visible": "true", "inline_incorrect_credentials_error_visible": "true"},
    auto_heal_version="AH2",
    default_action_timeout_ms=60000,
    default_navigation_timeout_ms=60000,
    kane_run_v4=True,
)

@testmu.test
async def test(page: Page):
    async with testmu.step('Navigate to http://localhost:3000', instruction_id='4f91982e-1878-4d48-95be-a87bf44ad5a2'):
        await page.goto("http://localhost:3000")
    
    async with testmu.step('Waiting for the plan steps to run', instruction_id='2da4bc30-1d1e-429a-adbb-c07b436be2eb'):
        await page.wait_for_timeout(1000)
    
    async with testmu.step('Waiting for the Username field to be ready', instruction_id='930b798d-e54b-46a7-a3a6-882030734877'):
        await page.wait_for_timeout(1000)
    
    async with testmu.step('Type "admin" into "Username"', instruction_id='93f57e78-2b73-4cdc-9c53-ec671ba7a567'):
        element_0 = page.locator("internal:role=textbox[name=\"Username\"i]")
        
        try:
            await element_0.click(timeout=2000)
        except Exception:
            pass
        await element_0.fill("admin")
        try:
            await element_0.press("End", timeout=2000)
        except Exception:
            pass
    
    async with testmu.step('Type "admin" into "Password"', instruction_id='94fd33c4-4782-4735-89f8-8152e2ec7fcd'):
        element_1 = page.locator("internal:role=textbox[name=\"Password\"i]")
        
        try:
            await element_1.click(timeout=2000)
        except Exception:
            pass
        await element_1.fill("admin")
        try:
            await element_1.press("End", timeout=2000)
        except Exception:
            pass
    
    async with testmu.step('Clicking Sign in button', instruction_id='d221db4e-9d15-4fc0-abba-a03283b2f6e0'):
        _loc_1 = page.locator("internal:role=button[name=\"Sign in\"i]")
        
        await _loc_1.click()
    
    async with testmu.step('Checking whether successful login state is present'):
        set_var('successful_login_check', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {5: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (/successfully\\s+logged\\s+in\\s+as\\s+admin/i.test(el(5).textContent || ''));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="You’re successfully logged in"i'], query='whether successful login state is present (in the signed-in confirmation message)', expected_value='true', needs_unit_conversion=False, operator='equals', transforms=[], condition='a successful login with username admin and password admin'))
    
    async with testmu.step('Checking whether welcome success state is present'):
        set_var('welcome_success_state_visible', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {4: 0};\n  const el = (i) => els[__m[i]];\n  const __v = ((el(4).textContent || '').trim().toLowerCase() === 'welcome back.' && !!(el(4).offsetWidth || el(4).offsetHeight || el(4).getClientRects().length));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:role=heading[name="Welcome back."i]'], query='whether welcome success state is present (in the signed-in page heading)', expected_value='true', needs_unit_conversion=False, operator='equals', transforms=[], condition='the welcome success state is shown'))
    
    async with testmu.step('Assertion check', instruction_id='ba470d7e-4acd-4b9d-a614-3c3fd6623df0'):
        await testmu.verify_assertion(page, 'Assertion check', {'operator': ['equals'], 'assertion_operands': [], 'left_operand': None, 'right_operand': None, 'operands': [], 'sub_results': [{'description': 'a successful login with username admin and password admin', 'passed': True, 'operator': 'equals', 'transforms': [], 'json_path': None, 'expected': 'true', 'extracted_value': '{{successful_login_check}}', 'store_key': 'successful_login_check', 'variable_refs': {'{{successful_login_check}}': 'true'}}], 'sub_checks': [{'description': 'a successful login with username admin and password admin', 'store_key': 'successful_login_check', 'expected_value': 'true', 'extracted_value': '{{successful_login_check}}', 'operator': 'equals', 'transforms': []}], 'composite_operator': 'and', 'claim': 'a successful login with username admin and password admin'})
    
    async with testmu.step('Assertion check', instruction_id='e8b90c7f-3522-420f-ab9c-fe4e71707fc5'):
        await testmu.verify_assertion(page, 'Assertion check', {'operator': ['equals'], 'assertion_operands': [], 'left_operand': None, 'right_operand': None, 'operands': [], 'sub_results': [{'description': 'the welcome success state is shown', 'passed': True, 'operator': 'equals', 'transforms': [], 'json_path': None, 'expected': 'true', 'extracted_value': '{{welcome_success_state_visible}}', 'store_key': 'welcome_success_state_visible', 'variable_refs': {'{{welcome_success_state_visible}}': 'true'}}], 'sub_checks': [{'description': 'the welcome success state is shown', 'store_key': 'welcome_success_state_visible', 'expected_value': 'true', 'extracted_value': '{{welcome_success_state_visible}}', 'operator': 'equals', 'transforms': []}], 'composite_operator': 'and', 'claim': 'the welcome success state is shown'})
    
    async with testmu.step('Clicking the Sign out button', instruction_id='6822dcfd-a821-4c1d-9ddb-fdcd6f0afe67'):
        _loc_2 = page.locator("internal:role=button[name=\"Sign out\"i]")
        
        await _loc_2.click()
    
    async with testmu.step('Waiting for the next queued step to run', instruction_id='043dcd56-81f1-447d-b8d1-74b66c5b02f8'):
        await page.wait_for_timeout(1000)
    
    async with testmu.step('Type "incorrect" into "Password"', instruction_id='518c613f-8162-411d-a3ef-3b223ba0bbf0'):
        element_2 = page.locator("internal:role=textbox[name=\"Password\"i]")
        
        try:
            await element_2.click(timeout=2000)
        except Exception:
            pass
        await element_2.fill("incorrect")
        try:
            await element_2.press("End", timeout=2000)
        except Exception:
            pass
    
    async with testmu.step('Clicking the Sign in button', instruction_id='8a406b92-97a5-439d-81b9-c0c3e5ae9381'):
        _loc_3 = page.locator("internal:role=button[name=\"Sign in\"i]")
        
        await _loc_3.click()
    
    async with testmu.step('Checking whether the inline incorrect-credentials error is present'):
        set_var('inline_incorrect_credentials_error_visible', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {11: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(11).getAttribute('role') === 'alert' && /incorrect username or password/i.test(el(11).textContent || ''));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Incorrect username or"i'], query='whether inline incorrect-credentials error is present (in the sign-in form)', expected_value='true', needs_unit_conversion=False, operator='equals', transforms=[], condition='an inline incorrect-credentials error is shown'))
    
    async with testmu.step('Assertion check', instruction_id='63a226d0-1e69-48f5-8692-cce03ff55b79'):
        await testmu.verify_assertion(page, 'Assertion check', {'operator': ['equals'], 'assertion_operands': [], 'left_operand': None, 'right_operand': None, 'operands': [], 'sub_results': [{'description': 'an inline incorrect-credentials error is shown', 'passed': True, 'operator': 'equals', 'transforms': [], 'json_path': None, 'expected': 'true', 'extracted_value': '{{inline_incorrect_credentials_error_visible}}', 'store_key': 'inline_incorrect_credentials_error_visible', 'variable_refs': {'{{inline_incorrect_credentials_error_visible}}': 'true'}}], 'sub_checks': [{'description': 'an inline incorrect-credentials error is shown', 'store_key': 'inline_incorrect_credentials_error_visible', 'expected_value': 'true', 'extracted_value': '{{inline_incorrect_credentials_error_visible}}', 'operator': 'equals', 'transforms': []}], 'composite_operator': 'and', 'claim': 'an inline incorrect-credentials error is shown'})


if __name__ == "__main__":
    testmu.run(test)